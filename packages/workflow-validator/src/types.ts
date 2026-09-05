export type ValidationSeverity = "error" | "warning";

export type ValidationCode =
  | "EMPTY_WORKFLOW"
  | "UNKNOWN_NODE_TYPE"
  | "DUPLICATE_NODE_ID"
  | "INVALID_EDGE_SOURCE"
  | "INVALID_EDGE_TARGET"
  | "INVALID_SOURCE_HANDLE"
  | "INVALID_TARGET_HANDLE"
  | "SELF_CONNECTION"
  | "INPUT_LIMIT_EXCEEDED"
  | "OUTPUT_LIMIT_EXCEEDED"
  | "NO_TRIGGER"
  | "MULTIPLE_TRIGGERS"
  | "TRIGGER_HAS_INPUT"
  | "CYCLE_DETECTED"
  | "ORPHAN_NODE"
  | "INVALID_NODE_CONFIG"
  | "NO_TRIGGER"
  | "TRIGGER_HAS_INPUT"
  | "CYCLE_DETECTED";

export interface ValidationIssue {
  code: ValidationCode;
  message: string;
  severity: ValidationSeverity;
  nodeId?: string;
  edgeId?: string;
  field?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  nodeErrors: Record<string, ValidationIssue[]>;
  edgeErrors: Record<string, ValidationIssue[]>;
}
