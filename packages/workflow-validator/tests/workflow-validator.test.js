import { describe, expect, test } from "vitest";
import { validateWorkflow } from "../src/index.js";
function node(id, type, config = {}) {
    return {
        id,
        type,
        position: { x: 0, y: 0 },
        config,
    };
}
function edge(id, source, sourceHandle, target, targetHandle) {
    return {
        id,
        source,
        sourceHandle,
        target,
        targetHandle,
    };
}
function validWorkflow() {
    return {
        id: "workflow-1",
        name: "Test Workflow",
        version: 1,
        nodes: [
            node("trigger-1", "trigger.manual"),
            node("transform-1", "data.transform", {
                mappings: {
                    output: "input",
                },
            }),
        ],
        edges: [edge("edge-1", "trigger-1", "main", "transform-1", "main")],
    };
}
describe("Workflow Validator", () => {
    test("accepts a valid workflow", () => {
        const result = validateWorkflow(validWorkflow());
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
    test("rejects an empty workflow", () => {
        const workflow = validWorkflow();
        workflow.nodes = [];
        workflow.edges = [];
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "EMPTY_WORKFLOW")).toBe(true);
    });
    test("rejects an unknown node type", () => {
        const workflow = validWorkflow();
        workflow.nodes.push(node("unknown-1", "something.unknown"));
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "UNKNOWN_NODE_TYPE")).toBe(true);
    });
    test("rejects duplicate node IDs", () => {
        const workflow = validWorkflow();
        workflow.nodes.push(node("transform-1", "data.transform"));
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "DUPLICATE_NODE_ID")).toBe(true);
    });
    test("rejects an invalid edge source", () => {
        const workflow = validWorkflow();
        workflow.edges[0] = edge("edge-1", "missing-node", "main", "transform-1", "main");
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "INVALID_EDGE_SOURCE")).toBe(true);
    });
    test("rejects an invalid edge target", () => {
        const workflow = validWorkflow();
        workflow.edges[0] = edge("edge-1", "trigger-1", "main", "missing-node", "main");
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "INVALID_EDGE_TARGET")).toBe(true);
    });
    test("rejects an invalid source handle", () => {
        const workflow = validWorkflow();
        workflow.edges[0] = edge("edge-1", "trigger-1", "invalid", "transform-1", "main");
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "INVALID_SOURCE_HANDLE")).toBe(true);
    });
    test("rejects an invalid target handle", () => {
        const workflow = validWorkflow();
        workflow.edges[0] = edge("edge-1", "trigger-1", "main", "transform-1", "invalid");
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "INVALID_TARGET_HANDLE")).toBe(true);
    });
    test("rejects a workflow without a trigger", () => {
        const workflow = validWorkflow();
        workflow.nodes[0] = node("start-1", "data.transform", {
            mappings: {
                output: "input",
            },
        });
        workflow.edges[0] = edge("edge-1", "start-1", "main", "transform-1", "main");
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "NO_TRIGGER")).toBe(true);
    });
    test("rejects multiple trigger nodes", () => {
        const workflow = validWorkflow();
        workflow.nodes.push(node("trigger-2", "trigger.manual"));
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "MULTIPLE_TRIGGERS")).toBe(true);
    });
    test("rejects a trigger with an input edge", () => {
        const workflow = validWorkflow();
        workflow.nodes.push(node("transform-2", "data.transform", {
            mappings: {
                output: "input",
            },
        }));
        workflow.edges.push(edge("edge-2", "transform-1", "main", "trigger-1", "main"));
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "TRIGGER_HAS_INPUT")).toBe(true);
    });
    test("rejects a self connection", () => {
        const workflow = validWorkflow();
        workflow.edges.push(edge("edge-2", "transform-1", "main", "transform-1", "main"));
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "SELF_CONNECTION")).toBe(true);
    });
    test("rejects an input connection limit violation", () => {
        const workflow = validWorkflow();
        workflow.nodes.push(node("transform-2", "data.transform", {
            mappings: {
                output: "input",
            },
        }));
        workflow.edges.push(edge("edge-2", "transform-2", "main", "transform-1", "main"));
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "INPUT_LIMIT_EXCEEDED")).toBe(true);
    });
    test("detects a workflow cycle", () => {
        const workflow = validWorkflow();
        workflow.edges.push(edge("edge-2", "transform-1", "main", "trigger-1", "main"));
        const result = validateWorkflow(workflow);
        expect(result.valid).toBe(false);
        expect(result.errors.some((issue) => issue.code === "CYCLE_DETECTED")).toBe(true);
    });
    test("allows multiple inputs on a Merge node", () => {
        const workflow = validWorkflow();
        workflow.nodes.push(node("merge-1", "logic.merge", {
            mode: "waitForAll",
        }));
        workflow.edges.push(edge("edge-2", "transform-1", "main", "merge-1", "main"), edge("edge-3", "trigger-1", "main", "merge-1", "main"));
        const result = validateWorkflow(workflow);
        expect(result.errors.some((issue) => issue.code === "INPUT_LIMIT_EXCEEDED" && issue.nodeId === "merge-1")).toBe(false);
    });
});
