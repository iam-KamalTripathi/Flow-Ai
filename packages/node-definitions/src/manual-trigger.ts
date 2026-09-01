import type { NodeDefinition } from "./types.js";

export interface ManualTriggerConfig {}

export const manualTriggerDefinition: NodeDefinition<ManualTriggerConfig> = {
  type: "trigger.manual",
  name: "Manual Trigger",
  description: "Starts a workflow manually",
  category: "trigger",
  inputs: [],
  outputs: [
    {
      id: "main",
      name: "Main",
      direction: "output",
      maxConnections: 1,
    },
  ],

  defaultConfig: {},
};
