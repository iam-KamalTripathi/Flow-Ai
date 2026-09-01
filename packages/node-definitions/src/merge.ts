import type { NodeDefinition } from "./types";

export interface MergeConfig {
  mode: "waitForAll";
}

export const mergeDefinition: NodeDefinition<MergeConfig> = {
  type: "logic.merge",
  name: "Merge",
  description: "Combines multiple incoming workflow branches",
  category: "logic",
  inputs: [
    {
      id: "main",
      name: "Main",
      direction: "input",
    },
  ],
  outputs: [
    {
      id: "main",
      name: "Main",
      direction: "output",
      maxConnections: 1,
    },
  ],

  defaultConfig: {
    mode: "waitForAll",
  },
};
