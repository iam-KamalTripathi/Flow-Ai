export const webHookTriggerDefinition = {
    type: "trigger.webhook",
    name: "Webhook Trigger",
    description: "Starts a workflow when HTTP webhook is received.",
    category: "trigger",
    inputs: [],
    outputs: [
        {
            id: "main",
            name: "Main",
            direction: "output",
            maxConnections: 1,
        },
    ],
    defaultConfig: {
        method: "POST",
        path: "",
        secret: "",
    },
};
