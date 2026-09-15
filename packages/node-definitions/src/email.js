export const emailDefinition = {
    type: "action.email",
    name: "Send Email",
    description: "Sends Email",
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
        to: "",
        subject: "",
        body: "",
    },
};
