import type { WorkflowDefinition } from "@FlowAi/workflow-core";
import { WorkflowRepository } from "../db/workflow-repository.js";
export declare class WorkflowService {
    private readonly repository;
    constructor(repository: WorkflowRepository);
    createWorkflow(workflow: WorkflowDefinition): Promise<{
        id: string;
        name: string;
        version: number;
        definition: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getWorkflow(id: string): Promise<{
        id: string;
        name: string;
        version: number;
        definition: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getWorkflows(): Promise<{
        id: string;
        name: string;
        version: number;
        definition: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateWorkflow(id: string, workflow: WorkflowDefinition): Promise<{
        id: string;
        name: string;
        version: number;
        definition: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteWorkflow(id: string): Promise<{
        id: string;
        name: string;
        version: number;
        definition: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=workflow-service.d.ts.map