import type { ExecutionContext } from "@FlowAi/workflow-engine";
import type { Prisma } from "@prisma/client";

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
    return prisma.execution.create({
      data: {
        id: input.id,
        workflowId: input.workflowId,
        status: input.status,
        currentNodeId: input.currentNodeId,
        triggerInput:
          input.triggerInput === undefined
            ? undefined
            : JSON.parse(JSON.stringify(input.triggerInput)),
        startedAt: new Date(input.startedAt),
      },
    });
  }

  async updateFromContext(context: ExecutionContext) {
    const data: Prisma.ExecutionUpdateInput = {
      status: context.status,
      currentNodeId: context.currentNodeId,
    };

    if (context.error !== undefined) {
      data.error = JSON.parse(
        JSON.stringify(context.error),
      ) as Prisma.InputJsonValue;
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
      where: {
        id,
      },
      include: {
        workflow: true,
      },
    });
  }

  async findByWorkflowId(workflowId: string) {
    return prisma.execution.findMany({
      where: {
        workflowId,
      },
      orderBy: {
        startedAt: "desc",
      },
    });
  }
}
