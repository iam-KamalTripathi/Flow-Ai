import { ExecutionEngine, ExecutorRegistry } from "@FlowAi/workflow-engine";
import { buildGraph } from "@FlowAi/workflow-validator";
import { createExecutionSnapshot } from "@FlowAi/workflow-engine";
export class ExecutionService {
    workflowRepository;
    executionRepository;
    constructor(workflowRepository, executionRepository) {
        this.workflowRepository = workflowRepository;
        this.executionRepository = executionRepository;
    }
    async executeWorkflow(workflowId, input) {
        // 1. Load workflow
        const savedWorkflow = await this.workflowRepository.findById(workflowId);
        if (!savedWorkflow) {
            throw new Error(`Workflow "${workflowId}" not found.`);
        }
        // 2. Restore workflow domain object
        const workflow = savedWorkflow.definition;
        // 3. Build execution graph
        const graph = buildGraph(workflow);
        // 4. Create executor registry
        const registry = new ExecutorRegistry();
        // 5. Create execution engine
        const engine = new ExecutionEngine(workflow, graph, registry);
        // 6. Create execution context
        const context = {
            executionId: crypto.randomUUID(),
            workflowId: workflow.id,
            status: "pending",
            currentNodeId: null,
            triggerInput: input.triggerInput,
            nodeOutputs: new Map(),
            startedAt: new Date().toISOString(),
        };
        // 7. Persist initial execution
        await this.executionRepository.create({
            id: context.executionId,
            workflowId: context.workflowId,
            status: context.status,
            currentNodeId: context.currentNodeId,
            triggerInput: context.triggerInput,
            startedAt: context.startedAt,
        });
        try {
            const result = await engine.execute(context);
            if (result.status === "failed") {
                const snapshot = createExecutionSnapshot(result);
                await this.executionRepository.saveSnapshot(result.executionId, snapshot);
            }
            await this.executionRepository.updateFromContext(result);
            return result;
        }
        catch (error) {
            context.status = "failed";
            const snapshot = createExecutionSnapshot(context);
            await this.executionRepository.saveSnapshot(context.executionId, snapshot);
            await this.executionRepository.updateFromContext(context);
            throw error;
        }
    }
    async getExecution(executionId) {
        const execution = await this.executionRepository.findById(executionId);
        if (!execution) {
            throw new Error(`Execution "${executionId}" not found.`);
        }
        return execution;
    }
    async getWorkflowExecutions(workflowId) {
        const workflow = await this.workflowRepository.findById(workflowId);
        if (!workflow) {
            throw new Error(`Workflow "${workflowId}" not found.`);
        }
        return this.executionRepository.findByWorkflowId(workflowId);
    }
}
