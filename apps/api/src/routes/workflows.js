import { Router } from "express";
import { ExecutionRepository } from "../db/execution-repositry.js";
import { WorkflowRepository } from "../db/workflow-repository.js";
import { ExecutionService } from "../services/execution-service.js";
import { WorkflowService } from "../services/workflow-service.js";
const router = Router();
const workflowRepository = new WorkflowRepository();
const workflowService = new WorkflowService(workflowRepository);
const executionRepository = new ExecutionRepository();
const executionService = new ExecutionService(workflowRepository, executionRepository);
// Create workflow
router.post("/", async (req, res) => {
    try {
        const workflow = req.body;
        const created = await workflowService.createWorkflow(workflow);
        res.status(201).json(created);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to create workflow.",
        });
    }
});
// Get all workflows
router.get("/", async (_req, res) => {
    try {
        const workflows = await workflowService.getWorkflows();
        res.status(200).json(workflows);
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch workflows.",
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
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to execute workflow.",
        });
    }
});
router.get("/:id/executions", async (req, res) => {
    try {
        const executions = await executionService.getWorkflowExecutions(req.params.id);
        res.status(200).json(executions);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch workflow executions.";
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
// Get workflow by ID
router.get("/:id", async (req, res) => {
    try {
        const workflow = await workflowService.getWorkflow(req.params.id);
        if (!workflow) {
            res.status(404).json({
                error: "Workflow not found.",
            });
            return;
        }
        res.status(200).json(workflow);
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch workflow.",
        });
    }
});
// Update workflow
router.put("/:id", async (req, res) => {
    try {
        const workflow = req.body;
        const updated = await workflowService.updateWorkflow(req.params.id, workflow);
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to update workflow.",
        });
    }
});
// Delete workflow
router.delete("/:id", async (req, res) => {
    try {
        await workflowService.deleteWorkflow(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(404).json({
            error: error instanceof Error ? error.message : "Failed to delete workflow.",
        });
    }
});
export default router;
