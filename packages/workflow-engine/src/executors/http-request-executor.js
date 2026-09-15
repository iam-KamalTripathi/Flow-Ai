import { ExecutionError } from "../errors/execution-error.js";
export class HttpRequestExecutor {
    async execute(node, input, context) {
        const config = node.config;
        const url = new URL(config.url);
        for (const [key, value] of Object.entries(config.query)) {
            url.searchParams.set(key, value);
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, config.timeout ?? 10000);
        try {
            const requestInit = {
                method: config.method,
                headers: config.headers,
                signal: controller.signal,
            };
            if (config.method !== "GET" && config.method !== "DELETE") {
                requestInit.body = JSON.stringify(config.body ?? input);
            }
            const response = await fetch(url, requestInit);
            const contentType = response.headers.get("content-type") ?? "";
            const data = contentType.includes("application/json")
                ? await response.json()
                : await response.text();
            if (!response.ok) {
                const retryable = response.status >= 500 || response.status === 429;
                throw new ExecutionError(`HTTP request failed wtih status ${response.status}.`, retryable);
            }
            return {
                output: {
                    status: response.status,
                    data,
                },
                outputHandle: "main",
            };
        }
        catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                throw new ExecutionError(`HTTP request timeout after ${config.timeout ?? 10000} ms.`, true);
            }
            throw error;
        }
        finally {
            clearTimeout(timeout);
        }
    }
}
