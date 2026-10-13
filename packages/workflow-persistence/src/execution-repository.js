import { Prisma as PrismaTypes } from "@prisma/client";
import { prisma } from "./prisma.js";
export class ExecutionRepository {
    async create(input) {
        const data = {
            id: input.id,
            workflowId: input.workflowId,
            status: input.status,
            currentNodeId: input.currentNodeId,
            startedAt: new Date(input.startedAt),
        };
        if (input.triggerInput !== undefined) {
            data.triggerInput = JSON.parse(JSON.stringify(input.triggerInput));
        }
        return prisma.execution.create({ data });
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
            where: { id },
            include: {
                workflow: true,
            },
        });
    }
    async findByWorkflowId(workflowId) {
        return prisma.execution.findMany({
            where: { workflowId },
            orderBy: {
                startedAt: "desc",
            },
        });
    }
    async saveSnapshot(executionId, snapshot) {
        return prisma.execution.update({
            where: { id: executionId },
            data: {
                snapshot: JSON.parse(JSON.stringify(snapshot)),
            },
        });
    }
    async prepareForResume(executionId, currentNodeId) {
        return prisma.execution.update({
            where: { id: executionId },
            data: {
                status: "pending",
                currentNodeId,
                error: PrismaTypes.DbNull,
                finishedAt: null,
            },
        });
    }
    async markEnqueueFailed(executionId, message) {
        return prisma.execution.update({
            where: { id: executionId },
            data: {
                status: "failed",
                error: {
                    stage: "enqueue",
                    message,
                },
                finishedAt: new Date(),
            },
        });
    }
}
