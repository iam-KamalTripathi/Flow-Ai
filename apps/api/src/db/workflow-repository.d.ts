import type { WorkflowDefinition } from "@FlowAi/workflow-core";
export declare class WorkflowRepository {
    create(workflow: WorkflowDefinition): Promise<{
        id: string;
        name: string;
        version: number;
        definition: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findById(id: string): Promise<{
        id: string;
        name: string;
        version: number;
        definition: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findAll(): Promise<{
        id: string;
        name: string;
        version: number;
        definition: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    update(id: string, workflow: WorkflowDefinition): Promise<{
        id: string;
        name: string;
        version: number;
        definition: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        version: number;
        definition: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=workflow-repository.d.ts.map