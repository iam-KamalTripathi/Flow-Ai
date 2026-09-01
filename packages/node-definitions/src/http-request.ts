import type { NodeDefinition } from "./types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestConfig {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export const httpRequestDefinition: NodeDefinition<HttpRequestConfig> = {
  type: "action.http",
  name: "HTTP Request",
  description: "Makes an HTTP request to an external service.",
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
    method: "GET",
    url: "",
    headers: {},
    query: {},
  },
};
