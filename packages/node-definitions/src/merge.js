export const mergeDefinition = {
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
