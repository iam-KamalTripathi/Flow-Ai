export const transformDefinition = {
    type: "data.transform",
    name: "Transform",
    description: "Transforms incoming workflow data",
    category: "data",
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
        mappings: {},
    },
};
