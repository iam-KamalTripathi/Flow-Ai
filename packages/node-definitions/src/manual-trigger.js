export const manualTriggerDefinition = {
    type: "trigger.manual",
    name: "Manual Trigger",
    description: "Starts a workflow manually",
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
    defaultConfig: {},
};
