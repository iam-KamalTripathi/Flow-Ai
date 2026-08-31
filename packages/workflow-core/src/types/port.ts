export type PortDirection = "input" | "output";

export interface Port {
  id: string;
  name: string;
  direction: PortDirection;
  maxConnections?: number;
}
