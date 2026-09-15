export class IfExecutor {
    async execute(node, input, _context) {
        const config = node.config;
        const results = config.conditions.map((condition) => this.evaluateCondition(condition, input));
        const conditionResult = config.combinator === "AND"
            ? results.every(Boolean)
            : results.some(Boolean);
        return {
            output: input,
            outputHandle: conditionResult ? "true" : "false",
        };
    }
    evaluateCondition(condition, input) {
        const fieldValue = this.getFieldValue(input, condition.field);
        const expectedValue = condition.value;
        switch (condition.operator) {
            case "equals":
                return fieldValue === expectedValue;
            case "not_equals":
                return fieldValue !== expectedValue;
            case "greater_than":
                return (typeof fieldValue === "number" &&
                    typeof expectedValue === "number" &&
                    fieldValue > expectedValue);
            case "less_than":
                return (typeof fieldValue === "number" &&
                    typeof expectedValue === "number" &&
                    fieldValue < expectedValue);
            case "greater_than_or_equal":
                return (typeof fieldValue === "number" &&
                    typeof expectedValue === "number" &&
                    fieldValue >= expectedValue);
            case "less_than_or_equal":
                return (typeof fieldValue === "number" &&
                    typeof expectedValue === "number" &&
                    fieldValue <= expectedValue);
            case "contains":
                return (typeof fieldValue === "string" &&
                    typeof expectedValue === "string" &&
                    fieldValue.includes(expectedValue));
            default:
                return false;
        }
    }
    getFieldValue(input, field) {
        if (typeof input !== "object" || input === null || Array.isArray(input)) {
            return undefined;
        }
        const data = input;
        return data[field];
    }
}
