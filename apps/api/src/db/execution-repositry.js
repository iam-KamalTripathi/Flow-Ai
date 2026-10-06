import { prisma } from "./prisma.js";
export class ExecutionRepository {
    async create(input) {
        return prisma.execution.create({
            data: {
                id: input.id,
                workflowId: input.workflowId,
                status: input.status,
                currentNodeId: input.currentNodeId,
                triggerInput: input.triggerInput === undefined
                    ? undefined
                    : JSON.parse(JSON.stringify(input.triggerInput)),
                startedAt: new Date(input.startedAt),
            },
        });
    }
    async updateFromContext(context) {
        const data = {
            status: context.status,
            currentNodeId: context.currentNodeId,
        };
        if (context.error !== undefined) {
            data.error = JSON.parse(JSON.stringify(context.error));
        }
        if (context.status === "success" || context.status === "failed") {
            data.finishedAt = new Date();
        }
        return prisma.execution.update({
            where: {
                id: context.executionId,
            },
            data,
        });
    }
    async findById(id) {
        return prisma.execution.findUnique({
            where: {
                id,
            },
            include: {
                workflow: true,
            },
        });
    }
    async findByWorkflowId(workflowId) {
        return prisma.execution.findMany({
            where: {
                workflowId,
            },
            orderBy: {
                startedAt: "desc",
            },
        });
    }
    async saveSnapshot(executionId, snapshot) {
        return prisma.execution.update({
            where: {
                id: executionId,
            },
            data: {
                snapshot: JSON.parse(JSON.stringify(snapshot)),
            },
        });
    }
}
