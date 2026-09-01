import type { NodeDefinition } from "./types";

export interface DelayConfig {
  duration: number;
  unit: "miliseconds" | "seconds" | "minutes";
}

export const delaydefinition: NodeDefinition<DelayConfig> = {
  type: "action.delay",
  name: "Delay",
  description: "Waits for a specified amount of time.",
  category: "action",
  inputs: [
    {
      id: "main",
      name: "Main",
      direction: "input",
      maxConnections: 1,
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
    duration: 1,
    unit: "seconds",
  },
};
