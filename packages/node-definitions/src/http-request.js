export const httpRequestDefinition = {
    type: "action.http",
    name: "HTTP Request",
    description: "Makes an HTTP request to an external service.",
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
        method: "GET",
        url: "",
        headers: {},
        query: {},
    },
};
