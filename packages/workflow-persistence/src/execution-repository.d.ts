import type { ExecutionContext, ExecutionSnapshot } from "@FlowAi/workflow-engine";
import { Prisma as PrismaTypes } from "@prisma/client";
export interface CreateExecutionInput {
    id: string;
    workflowId: string;
    status: string;
    currentNodeId: string | null;
    triggerInput: unknown;
    startedAt: string;
}
export declare class ExecutionRepository {
    create(input: CreateExecutionInput): Promise<{
        id: string;
        workflowId: string;
        status: string;
        currentNodeId: string | null;
        triggerInput: PrismaTypes.JsonValue | null;
        snapshot: PrismaTypes.JsonValue | null;
        error: PrismaTypes.JsonValue | null;
        startedAt: Date;
        finishedAt: Date | null;
    }>;
    updateFromContext(context: ExecutionContext): Promise<{
        id: string;
        workflowId: string;
        status: string;
        currentNodeId: string | null;
        triggerInput: PrismaTypes.JsonValue | null;
        snapshot: PrismaTypes.JsonValue | null;
        error: PrismaTypes.JsonValue | null;
        startedAt: Date;
        finishedAt: Date | null;
    }>;
    findById(id: string): Promise<({
        workflow: {
            id: string;
            name: string;
            version: number;
            definition: PrismaTypes.JsonValue;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        workflowId: string;
        status: string;
        currentNodeId: string | null;
        triggerInput: PrismaTypes.JsonValue | null;
        snapshot: PrismaTypes.JsonValue | null;
        error: PrismaTypes.JsonValue | null;
        startedAt: Date;
        finishedAt: Date | null;
    }) | null>;
    findByWorkflowId(workflowId: string): Promise<{
        id: string;
        workflowId: string;
        status: string;
        currentNodeId: string | null;
        triggerInput: PrismaTypes.JsonValue | null;
        snapshot: PrismaTypes.JsonValue | null;
        error: PrismaTypes.JsonValue | null;
        startedAt: Date;
        finishedAt: Date | null;
    }[]>;
    saveSnapshot(executionId: string, snapshot: ExecutionSnapshot): Promise<{
        id: string;
        workflowId: string;
        status: string;
        currentNodeId: string | null;
        triggerInput: PrismaTypes.JsonValue | null;
        snapshot: PrismaTypes.JsonValue | null;
        error: PrismaTypes.JsonValue | null;
        startedAt: Date;
        finishedAt: Date | null;
    }>;
    prepareForResume(executionId: string, currentNodeId: string): Promise<{
        id: string;
        workflowId: string;
        status: string;
        currentNodeId: string | null;
        triggerInput: PrismaTypes.JsonValue | null;
        snapshot: PrismaTypes.JsonValue | null;
        error: PrismaTypes.JsonValue | null;
        startedAt: Date;
        finishedAt: Date | null;
    }>;
    markEnqueueFailed(executionId: string, message: string): Promise<{
        id: string;
        workflowId: string;
        status: string;
        currentNodeId: string | null;
        triggerInput: PrismaTypes.JsonValue | null;
        snapshot: PrismaTypes.JsonValue | null;
        error: PrismaTypes.JsonValue | null;
        startedAt: Date;
        finishedAt: Date | null;
    }>;
}
//# sourceMappingURL=execution-repository.d.ts.map