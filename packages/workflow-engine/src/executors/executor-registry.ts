import type { NodeExecutor } from "./node-executor.js";
import { ManualTriggerExecutor } from "./manual-trigger-executor.js";
import { TransformExecutor } from "./transform-executor.js";

export class ExecutorRegistry {
  private readonly executors = new Map<string, NodeExecutor>();

  constructor() {
    this.register("trigger.manual", new ManualTriggerExecutor());
    this.register("data.transform", new TransformExecutor());
  }

  register(nodeType: string, executor: NodeExecutor): void {
    if (this.executors.has(nodeType)) {
      throw new Error(`Executor already registered for node type ${nodeType}.`);
    }

    this.executors.set(nodeType, executor);
  }
  get(nodeType: string): NodeExecutor {
    const executor = this.executors.get(nodeType);

    if (!executor) {
      throw new Error(`No executor registered for node type ${nodeType} .`);
    }

    return executor;
  }

  has(nodeType: string): boolean {
    return this.executors.has(nodeType);
  }
}
