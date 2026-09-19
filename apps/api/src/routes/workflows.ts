import { Router } from "express";

import type { WorkflowDefinition } from "@FlowAi/workflow-core";

import { WorkflowRepository } from "../db/workflow-repository.js";
import { WorkflowService } from "../services/workflow-service.js";

const router: Router = Router();

const repository = new WorkflowRepository();
const service = new WorkflowService(repository);

router.post("/", async (req, res) => {
  try {
    const workflow = req.body as WorkflowDefinition;

    const created = await service.createWorkflow(workflow);

    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({
      error:
        error instanceof Error ? error.message : "Failed to create workflow.",
    });
  }
});

export default router;
