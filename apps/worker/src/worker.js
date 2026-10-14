import { Worker } from "bullmq";
import Redis from "ioredis";
import { createExecutionSnapshot, ExecutionEngine, ExecutionError, ExecutorRegistry, } from "@FlowAi/workflow-engine";
import { buildGraph, validateWorkflow } from "@FlowAi/workflow-validator";
import { ExecutionRepository } from "@FlowAi/workflow-persistence";
import { EXECUTION_QUEUE_NAME, } from "@FlowAi/workflow-queue/contract";
const connection = {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
};
const TELEMETRY_CHANNEL = "flowai:execution:telemetry";
const telemetryPublisher = new Redis(connection);
function publishTelemetry(event) {
    console.log("[Telemetry] Event received from engine:", event.type);
    void telemetryPublisher
        .publish(TELEMETRY_CHANNEL, JSON.stringify(event))
        .then((subscriberCount) => {
        console.log("[Telemetry] Redis publish result:", {
            type: event.type,
            subscriberCount,
        });
    })
        .catch((error) => {
        console.error("[Telemetry] Failed to publish event:", error);
    });
}
const executionRepository = new ExecutionRepository();
function restoreContext(execution) {
    const rawSnapshot = execution.snapshot;
    const snapshot = rawSnapshot !== null &&
        typeof rawSnapshot === "object" &&
        !Array.isArray(rawSnapshot)
        ? rawSnapshot
        : null;
    return {
        executionId: execution.id,
        workflowId: execution.workflowId,
        status: "pending",
        currentNodeId: snapshot ? snapshot.currentNodeId : execution.currentNodeId,
        triggerInput: snapshot ? snapshot.triggerInput : execution.triggerInput,
        nodeOutputs: new Map(snapshot ? Object.entries(snapshot.nodeOutputs) : []),
        startedAt: execution.startedAt.toISOString(),
        ...(snapshot?.retryState ? { retryState: snapshot.retryState } : {}),
    };
}
function markFailed(context, error) {
    context.status = "failed";
    context.error = {
        nodeId: context.currentNodeId ?? "workflow",
        message: error instanceof Error ? error.message : String(error),
        retryable: error instanceof ExecutionError ? error.retryable : false,
    };
    return context;
}
async function processExecutionJob(job) {
    const { executionId, workflowId } = job.data;
    console.log("Processing workflow execution:", {
        jobId: job.id,
        executionId,
        workflowId,
    });
    const execution = await executionRepository.findById(executionId);
    if (!execution) {
        throw new Error(`Execution ${executionId} was not found.`);
    }
    if (execution.workflowId !== workflowId) {
        throw new Error(`Execution ${executionId} belongs to workflow ${execution.workflowId}, not ${workflowId}.`);
    }
    // Do not execute an already completed or terminally failed execution.
    // Resuming a failed execution must first put it back into "pending".
    if (execution.status === "success" || execution.status === "failed") {
        console.log(`Skipping execution ${executionId}: status is ${execution.status}.`);
        return {
            executionId,
            status: execution.status,
        };
    }
    if (execution.status !== "pending" && execution.status !== "running") {
        throw new Error(`Cannot process execution ${executionId} with status "${execution.status}".`);
    }
    const context = restoreContext(execution);
    const workflow = execution.workflow
        .definition;
    let engine;
    // Validate and construct the engine before marking execution as running.
    // Workflow-level setup errors are saved as failed executions.
    try {
        const validation = validateWorkflow(workflow);
        if (!validation.valid) {
            throw new Error(`Invalid workflow: ${JSON.stringify(validation.errors)}`);
        }
        const graph = buildGraph(workflow);
        engine = new ExecutionEngine(workflow, graph, new ExecutorRegistry(), {
            onEvent: publishTelemetry,
        });
    }
    catch (error) {
        const failedContext = markFailed(context, error);
        await executionRepository.saveSnapshot(executionId, createExecutionSnapshot(failedContext));
        await executionRepository.updateFromContext(failedContext);
        console.error(`Workflow setup failed for ${executionId}:`, error);
        return {
            executionId,
            status: failedContext.status,
        };
    }
    // Persist "running" before starting node execution.
    // Database failures here propagate to BullMQ so the job can be retried.
    context.status = "running";
    await executionRepository.updateFromContext(context);
    let result;
    try {
        result = await engine.execute(context);
    }
    catch (error) {
        // ExecutionEngine can throw before entering its own main try/catch.
        // Convert such errors into a persisted failed execution.
        result = markFailed(context, error);
    }
    // Save the in-memory execution state only on failure.
    // This preserves earlier outputs for a later resume.
    if (result.status === "failed") {
        await executionRepository.saveSnapshot(executionId, createExecutionSnapshot(result));
    }
    await executionRepository.updateFromContext(result);
    console.log(`Execution ${executionId} finished: ${result.status}`);
    if (result.error) {
        console.error("Execution error:", result.error);
    }
    return {
        executionId,
        status: result.status,
    };
}
const worker = new Worker(EXECUTION_QUEUE_NAME, processExecutionJob, { connection });
worker.on("completed", (job, result) => {
    console.log("Queue job processed:", {
        jobId: job.id,
        executionId: result.executionId,
        executionStatus: result.status,
    });
});
worker.on("failed", (job, error) => {
    console.error(`Queue job ${job?.id ?? "unknown"} failed:`, error);
});
worker.on("error", (error) => {
    console.error("Worker error:", error);
});
console.log(`FlowAI worker listening on queue "${EXECUTION_QUEUE_NAME}"...`);
async function shutdown(signal) {
    console.log(`Received ${signal}. Shutting down FlowAI worker...`);
    try {
        await worker.close();
        await telemetryPublisher.quit();
        console.log("FlowAI worker shut down cleanly.");
    }
    catch (error) {
        console.error("Worker shutdown failed:", error);
        process.exitCode = 1;
    }
}
process.once("SIGINT", () => {
    void shutdown("SIGINT");
});
process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
});
