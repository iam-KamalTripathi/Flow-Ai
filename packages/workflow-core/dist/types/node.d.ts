import type { Position } from "./position";
export interface WorkflowNode<TConfig = unknown> {
    id: string;
    type: string;
    position: Position;
    config: TConfig;
}
//# sourceMappingURL=node.d.ts.map