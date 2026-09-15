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
export declare const httpRequestDefinition: NodeDefinition<HttpRequestConfig>;
//# sourceMappingURL=http-request.d.ts.map