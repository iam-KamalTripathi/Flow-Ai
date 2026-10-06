import { Router } from "express";
import { ExecutionRepository } from "../db/execution-repositry.js";
import { WorkflowRepository } from "../db/workflow-repository.js";
import { ExecutionService } from "../services/execution-service.js";
const router = Router();
const workflowRepository = new WorkflowRepository();
const executionRepository = new ExecutionRepository();
const executionService = new ExecutionService(workflowRepository, executionRepository);
// Get execution by ID
router.get("/:id", async (req, res) => {
    try {
        const execution = await executionService.getExecution(req.params.id);
        res.status(200).json(execution);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch execution.";
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
