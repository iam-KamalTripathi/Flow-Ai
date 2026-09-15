import { ManualTriggerExecutor } from "./manual-trigger-executor.js";
import { TransformExecutor } from "./transform-executor.js";
import { HttpRequestExecutor } from "./http-request-executor.js";
import { IfExecutor } from "./if-executors.js";
export class ExecutorRegistry {
    executors = new Map();
    constructor() {
        this.register("trigger.manual", new ManualTriggerExecutor());
        this.register("data.transform", new TransformExecutor());
        this.register("action.http", new HttpRequestExecutor());
        this.register("logic.if", new IfExecutor());
    }
    register(nodeType, executor) {
        if (this.executors.has(nodeType)) {
            throw new Error(`Executor already registered for node type ${nodeType}.`);
        }
        this.executors.set(nodeType, executor);
    }
    get(nodeType) {
        const executor = this.executors.get(nodeType);
        if (!executor) {
            throw new Error(`No executor registered for node type ${nodeType} .`);
        }
        return executor;
    }
    has(nodeType) {
        return this.executors.has(nodeType);
    }
}
