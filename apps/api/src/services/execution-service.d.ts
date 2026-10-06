import type { ExecutionContext } from "@FlowAi/workflow-engine";
import { ExecutionRepository } from "../db/execution-repositry.js";
import { WorkflowRepository } from "../db/workflow-repository.js";
export interface ExecuteWorkflowInput {
    triggerInput: unknown;
}
export declare class ExecutionService {
    private readonly workflowRepository;
    private readonly executionRepository;
    constructor(workflowRepository: WorkflowRepository, executionRepository: ExecutionRepository);
    executeWorkflow(workflowId: string, input: ExecuteWorkflowInput): Promise<ExecutionContext>;
    getExecution(executionId: string): Promise<{
        workflow: {
            id: string;
            name: string;
            version: number;
            definition: import("@prisma/client/runtime/client").JsonValue;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        workflowId: string;
        status: string;
        currentNodeId: string | null;
        triggerInput: import("@prisma/client/runtime/client").JsonValue | null;
        snapshot: import("@prisma/client/runtime/client").JsonValue | null;
        error: import("@prisma/client/runtime/client").JsonValue | null;
        startedAt: Date;
        finishedAt: Date | null;
    }>;
    getWorkflowExecutions(workflowId: string): Promise<{
        id: string;
        workflowId: string;
        status: string;
        currentNodeId: string | null;
        triggerInput: import("@prisma/client/runtime/client").JsonValue | null;
        snapshot: import("@prisma/client/runtime/client").JsonValue | null;
        error: import("@prisma/client/runtime/client").JsonValue | null;
        startedAt: Date;
        finishedAt: Date | null;
    }[]>;
}
//# sourceMappingURL=execution-service.d.ts.map