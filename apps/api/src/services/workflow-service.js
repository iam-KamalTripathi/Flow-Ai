import { validateWorkflow } from "@FlowAi/workflow-validator";
export class WorkflowService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async createWorkflow(workflow) {
        const validation = validateWorkflow(workflow);
        if (!validation.valid) {
            throw new Error(`Invalid workflow: ${validation.errors
                .map((issue) => issue.message)
                .join("; ")}`);
        }
        return this.repository.create(workflow);
    }
    async getWorkflow(id) {
        return this.repository.findById(id);
    }
    async getWorkflows() {
        return this.repository.findAll();
    }
    async updateWorkflow(id, workflow) {
        const validation = validateWorkflow(workflow);
        if (!validation.valid) {
            throw new Error(`Invalid workflow: ${validation.errors
                .map((issue) => issue.message)
                .join("; ")}`);
        }
        return this.repository.update(id, workflow);
    }
    async deleteWorkflow(id) {
        return this.repository.delete(id);
    }
}
