export class TransformExecutor {
    async execute(node, input, _context) {
        const config = node.config;
        if (typeof input !== "object" || input == null || Array.isArray(input)) {
            throw new Error(`Transform node ${node.id} expects an object as input.`);
        }
        const inputData = input;
        const output = {};
        for (const [outputKey, inputKey] of Object.entries(config.mappings)) {
            output[outputKey] = inputData[inputKey];
        }
        return {
            output,
            outputHandle: "main",
        };
    }
}
