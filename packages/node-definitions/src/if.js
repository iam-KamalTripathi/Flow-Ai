export const ifDefinition = {
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
            id: "false",
            name: "False",
            direction: "output",
            maxConnections: 1,
        },
    ],
    defaultConfig: {
        conditions: [],
        combinator: "AND",
    },
};
