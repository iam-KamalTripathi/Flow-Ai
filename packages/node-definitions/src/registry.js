import { manualTriggerDefinition } from "./manual-trigger.js";
import { webHookTriggerDefinition } from "./webhook-trigger.js";
import { httpRequestDefinition } from "./http-request.js";
import { transformDefinition } from "./transform.js";
import { ifDefinition } from "./if.js";
import { emailDefinition } from "./email.js";
import { delaydefinition } from "./delay.js";
import { mergeDefinition } from "./merge.js";
export const NodeDefinitions = [
    manualTriggerDefinition,
    webHookTriggerDefinition,
    httpRequestDefinition,
    transformDefinition,
    ifDefinition,
    emailDefinition,
    delaydefinition,
    mergeDefinition,
];
const registry = new Map();
for (const definition of NodeDefinitions) {
    registry.set(definition.type, definition);
}
export function getNodeDefinition(type) {
    return registry.get(type);
}
export function hasNodeDefinition(type) {
    return registry.has(type);
}
