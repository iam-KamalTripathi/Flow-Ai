import type { NodeDefinition } from "./types";
export type ComparisonOperator = "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "contains";
export interface Condition {
    field: string;
    operator: ComparisonOperator;
    value: unknown;
}
export interface IfConfig {
    conditions: Condition[];
    combinator: "AND" | "OR";
}
export declare const ifDefinition: NodeDefinition<IfConfig>;
//# sourceMappingURL=if.d.ts.map