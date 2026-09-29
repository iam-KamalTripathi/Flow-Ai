import { Router } from "express";

import type { WorkflowDefinition } from "@FlowAi/workflow-core";

import { WorkflowRepository } from "../db/workflow-repository.js";
import { WorkflowService } from "../services/workflow-service.js";
import { ExecutionService } from "../services/execution-service.js";

const router: Router = Router();

const repository = new WorkflowRepository();
const service = new WorkflowService(repository);
const executionService = new ExecutionService(repository);

// Create workflow
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

// Get all workflows
router.get("/", async (_req, res) => {
  try {
    const workflows = await service.getWorkflows();

    res.status(200).json(workflows);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch workflows.",
    });
  }
});

// Execute workflow
router.post("/:id/execute", async (req, res) => {
  try {
    const result = await executionService.executeWorkflow(req.params.id, {
      triggerInput: req.body?.triggerInput,
    });

    res.status(200).json({
      executionId: result.executionId,
      workflowId: result.workflowId,
      status: result.status,
      currentNodeId: result.currentNodeId,
      triggerInput: result.triggerInput,
      nodeOutputs: Object.fromEntries(result.nodeOutputs),
      error: result.error,
    });
  } catch (error) {
    res.status(400).json({
      error:
        error instanceof Error ? error.message : "Failed to execute workflow.",
    });
  }
});

// Get workflow by ID
router.get("/:id", async (req, res) => {
  try {
    const workflow = await service.getWorkflow(req.params.id);

    if (!workflow) {
      res.status(404).json({
        error: "Workflow not found.",
      });
      return;
    }

    res.status(200).json(workflow);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch workflow.",
    });
  }
});

// Update workflow
router.put("/:id", async (req, res) => {
  try {
    const workflow = req.body as WorkflowDefinition;

    const updated = await service.updateWorkflow(req.params.id, workflow);

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to update workflow.",
    });
  }
});

// Delete workflow
router.delete("/:id", async (req, res) => {
  try {
    await service.deleteWorkflow(req.params.id);

    res.status(204).send();
  } catch (error) {
    res.status(404).json({
      error:
        error instanceof Error ? error.message : "Failed to delete workflow.",
    });
  }
});

export default router;
