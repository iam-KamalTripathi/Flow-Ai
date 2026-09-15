export class ManualTriggerExecutor {
    async execute(_node, input, _context) {
        return {
            output: input,
            outputHandle: "main",
        };
    }
}
