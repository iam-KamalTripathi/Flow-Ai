import type { WorkflowDefinition } from "@FlowAi/workflow-core";
import { validateWorkflow } from "@FlowAi/workflow-validator";

import { WorkflowRepository } from "../db/workflow-repository.js";

export class WorkflowService {
  constructor(private readonly repository: WorkflowRepository) {}

  async createWorkflow(workflow: WorkflowDefinition) {
    const validation = validateWorkflow(workflow);

    if (!validation.valid) {
      throw new Error(
        `Invalid workflow: ${validation.errors
          .map((issue) => issue.message)
          .join("; ")}`,
      );
    }

    return this.repository.create(workflow);
  }

  async getWorkflow(id: string) {
    return this.repository.findById(id);
  }

  async getWorkflows() {
    return this.repository.findAll();
  }

  async updateWorkflow(id: string, workflow: WorkflowDefinition) {
    const validation = validateWorkflow(workflow);

    if (!validation.valid) {
      throw new Error(
        `Invalid workflow: ${validation.errors
          .map((issue) => issue.message)
          .join("; ")}`,
      );
    }

    return this.repository.update(id, workflow);
  }

  async deleteWorkflow(id: string) {
    return this.repository.delete(id);
  }
}
