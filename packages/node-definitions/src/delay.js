export const delaydefinition = {
    type: "action.delay",
    name: "Delay",
    description: "Waits for a specified amount of time.",
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
        duration: 1,
        unit: "seconds",
    },
};
