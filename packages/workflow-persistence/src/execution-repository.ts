import type {
  ExecutionContext,
  ExecutionSnapshot,
} from "@FlowAi/workflow-engine";

import { Prisma as PrismaTypes } from "@prisma/client";

import { prisma } from "./prisma.js";

export interface CreateExecutionInput {
  id: string;
  workflowId: string;
  status: string;
  currentNodeId: string | null;
  triggerInput: unknown;
  startedAt: string;
}

export class ExecutionRepository {
  async create(input: CreateExecutionInput) {
    const data: PrismaTypes.ExecutionUncheckedCreateInput = {
      id: input.id,
      workflowId: input.workflowId,
      status: input.status,
      currentNodeId: input.currentNodeId,
      startedAt: new Date(input.startedAt),
    };

    if (input.triggerInput !== undefined) {
      data.triggerInput = JSON.parse(
        JSON.stringify(input.triggerInput),
      ) as PrismaTypes.InputJsonValue;
    }

    return prisma.execution.create({ data });
  }

  async updateFromContext(context: ExecutionContext) {
    const data: PrismaTypes.ExecutionUpdateInput = {
      status: context.status,
      currentNodeId: context.currentNodeId,
    };

    if (context.error !== undefined) {
      data.error = JSON.parse(
        JSON.stringify(context.error),
      ) as PrismaTypes.InputJsonValue;
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

  async findById(id: string) {
    return prisma.execution.findUnique({
      where: { id },
      include: {
        workflow: true,
      },
    });
  }

  async findByWorkflowId(workflowId: string) {
    return prisma.execution.findMany({
      where: { workflowId },
      orderBy: {
        startedAt: "desc",
      },
    });
  }

  async saveSnapshot(executionId: string, snapshot: ExecutionSnapshot) {
    return prisma.execution.update({
      where: { id: executionId },
      data: {
        snapshot: JSON.parse(
          JSON.stringify(snapshot),
        ) as PrismaTypes.InputJsonValue,
      },
    });
  }

  async prepareForResume(executionId: string, currentNodeId: string) {
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

  async markEnqueueFailed(executionId: string, message: string) {
    return prisma.execution.update({
      where: { id: executionId },
      data: {
        status: "failed",
        error: {
          stage: "enqueue",
          message,
        } as PrismaTypes.InputJsonValue,
        finishedAt: new Date(),
      },
    });
  }
}
