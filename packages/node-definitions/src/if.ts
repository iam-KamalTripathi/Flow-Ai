import type { NodeDefinition } from "./types";

export type ComparisonOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "contains";

export interface Condition {
  field: string;
  operator: ComparisonOperator;
  value: unknown;
}

export interface IfConfig {
  conditions: Condition[];
  combinator: "AND" | "OR";
}

export const ifDefinition: NodeDefinition<IfConfig> = {
  type: "logic.if",
  name: "IF",
  description: "Branches workflow execution based on condition",
  category: "logic",
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
      id: "true",
      name: "True",
      direction: "output",
      maxConnections: 1,
    },
    {
      id: "main",
      name: "Main",
      direction: "output",
      maxConnections: 1,
    },
  ],

  defaultConfig: {
    conditions: [],
    combinator: "AND",
  },
};
