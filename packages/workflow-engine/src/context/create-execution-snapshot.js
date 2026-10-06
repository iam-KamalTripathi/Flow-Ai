export function createExecutionSnapshot(context) {
    const snapshot = {
        currentNodeId: context.currentNodeId,
        nodeOutputs: Object.fromEntries(context.nodeOutputs),
        triggerInput: context.triggerInput,
    };
    if (context.retryState !== undefined) {
        snapshot.retryState = context.retryState;
    }
    return snapshot;
}
