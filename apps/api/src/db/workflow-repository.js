import { prisma } from "./prisma.js";
export class WorkflowRepository {
    async create(workflow) {
        return prisma.workflow.create({
            data: {
                id: workflow.id,
                name: workflow.name,
                version: workflow.version,
                definition: JSON.parse(JSON.stringify(workflow)),
            },
        });
    }
    async findById(id) {
        return prisma.workflow.findUnique({
            where: {
                id,
            },
        });
    }
    async findAll() {
        return prisma.workflow.findMany({
            orderBy: {
                updatedAt: "desc",
            },
        });
    }
    async update(id, workflow) {
        return prisma.workflow.update({
            where: {
                id,
            },
            data: {
                name: workflow.name,
                version: workflow.version,
                definition: JSON.parse(JSON.stringify(workflow)),
            },
        });
    }
    async delete(id) {
        return prisma.workflow.delete({
            where: {
                id,
            },
        });
    }
}
