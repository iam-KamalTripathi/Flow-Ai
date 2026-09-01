import type { Port } from "@FlowAi/workflow-core";

export type NodeCategory = "trigger" | "action" | "logic" | "data";

export interface NodeDefinition<TConfig = unknown> {
  type: string;
  name: string;
  description: string;
  category: NodeCategory;
  inputs: Port[];
  outputs: Port[];
  defaultConfig: TConfig;
}
