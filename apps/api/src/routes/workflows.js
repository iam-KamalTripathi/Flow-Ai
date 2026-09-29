import { Router } from "express";
import { WorkflowRepository } from "../db/workflow-repository.js";
import { WorkflowService } from "../services/workflow-service.js";
const router = Router();
const repository = new WorkflowRepository();
const service = new WorkflowService(repository);
router.post("/", async (req, res) => {
    try {
        const workflow = req.body;
        const created = await service.createWorkflow(workflow);
        res.status(201).json(created);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to create workflow.",
        });
    }
});
router.get("/", async (_req, res) => {
    try {
        const worflows = await service.getWorkflows();
        res.status(200).json(worflows);
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failded to fetch workflows.",
        });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const worflow = await service.getWorkflow(req.params.id);
        if (!worflow) {
            res.status(404).json({
                error: "Workflow not found.",
            });
            return;
        }
        res.status(200).json(worflow);
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failded to fetch workflow.",
        });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const worflow = req.body;
        const updated = await service.updateWorkflow(req.params.id, worflow);
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failded to update workflow.",
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        await service.deleteWorkflow(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(404).json({
            error: error instanceof Error ? error.message : "Failded to delete workflow.",
        });
    }
});
export default router;
