import { Router } from "express";

import { ExecutionRepository } from "../db/execution-repositry.js";
import { WorkflowRepository } from "../db/workflow-repository.js";
import { ExecutionService } from "../services/execution-service.js";

const router: Router = Router();

const workflowRepository = new WorkflowRepository();
const executionRepository = new ExecutionRepository();

const executionService = new ExecutionService(
  workflowRepository,
  executionRepository,
);

router.post("/:id/resume", async (req, res) => {
  try {
    const result = await executionService.resumeExecution(req.params.id);

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
    const message =
      error instanceof Error ? error.message : "Failed to resume execution.";

    if (
      message.includes("not found") ||
      message.includes("cannot be resumed") ||
      message.includes("does not have")
    ) {
      res.status(400).json({
        error: message,
      });
      return;
    }

    res.status(500).json({
      error: message,
    });
  }
});

// Get execution by ID
router.get("/:id", async (req, res) => {
  try {
    const execution = await executionService.getExecution(req.params.id);

    res.status(200).json(execution);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch execution.";

    if (message.includes("not found")) {
      res.status(404).json({
        error: message,
      });
      return;
    }

    res.status(500).json({
      error: message,
    });
  }
});

export default router;
