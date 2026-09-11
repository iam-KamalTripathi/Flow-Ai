import type { WorkflowNode } from "@FlowAi/workflow-core";

import type { HttpRequestConfig } from "@FlowAi/node-definitions";

import type { ExecutionContext } from "../context/execution-context.js";

import type { NodeExecutor } from "./node-executor.js";
import { ExecutionError } from "../errors/execution-error.js";

export class HttpRequestExecutor implements NodeExecutor {
  async execute(
    node: WorkflowNode,
    input: unknown,
    context: ExecutionContext,
  ): Promise<unknown> {
    const config = node.config as HttpRequestConfig;

    const url = new URL(config.url);

    for (const [key, value] of Object.entries(config.query)) {
      url.searchParams.set(key, value);
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, config.timeout ?? 10000);

    try {
      const requestInit: RequestInit = {
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

        throw new ExecutionError(
          `HTTP request failed wtih status ${response.status}.`,
          retryable,
        );
      }

      return {
        status: response.status,
        data,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ExecutionError(
          `HTTP request timeout after ${config.timeout ?? 10000} ms.`,
          true,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
