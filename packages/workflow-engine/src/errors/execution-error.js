export class ExecutionError extends Error {
    retryable;
    constructor(message, retryable) {
        super(message);
        this.retryable = retryable;
        this.name = "ExecutonError";
    }
}
