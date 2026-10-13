import { enqueueExecution, closeExecutionQueue } from "@FlowAi/workflow-queue";
async function main() {
    try {
        const job = await enqueueExecution({
            executionId: "test-execution-002",
            workflowId: "test-workflow-002",
        });
        console.log("Execution job added:", {
            jobId: job.id,
            executionId: job.data.executionId,
            workflowId: job.data.workflowId,
        });
    }
    catch (error) {
        console.error("Failed to enqueue execution:", error);
        process.exitCode = 1;
    }
    finally {
        await closeExecutionQueue();
    }
}
await main();
