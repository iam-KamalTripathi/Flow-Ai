import { NodeDefinition } from "./types";
export interface WebHookTriggerConfig {
    method: "GET" | "POST";
    path: string;
    secret?: string;
}
export declare const webHookTriggerDefinition: NodeDefinition<WebHookTriggerConfig>;
//# sourceMappingURL=webhook-trigger.d.ts.map