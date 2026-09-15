import type { NodeExecutor } from "./node-executor.js";
export declare class ExecutorRegistry {
    private readonly executors;
    constructor();
    register(nodeType: string, executor: NodeExecutor): void;
    get(nodeType: string): NodeExecutor;
    has(nodeType: string): boolean;
}
//# sourceMappingURL=executor-registry.d.ts.map