import type { NodeExecutor } from "./node-executor";

export class ExecutorRegistory {
  private readonly executors = new Map<string, NodeExecutor>();

  register(nodeType: string, executor: NodeExecutor): void {
    if (this.executors.has(nodeType)) {
      throw new Error(`Executor alrady registered for node type ${nodeType}.`);
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
