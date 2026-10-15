export const nodePresentation = {
  "trigger.manual": {
    glyph: "▶",
    nodeClassName: "trigger-node",
    glyphClassName: "trigger-glyph",
    footerText: "Ready to trigger",
    minimapColor: "#22c55e",
  },

  "data.transform": {
    glyph: "fx",
    nodeClassName: "transform-node",
    glyphClassName: "transform-glyph",
    footerText: "Data processing",
    minimapColor: "#8b5cf6",
  },

  "action.http": {
    glyph: "↗",
    nodeClassName: "http-node",
    glyphClassName: "http-glyph",
    footerText: "External request",
    minimapColor: "#3b82f6",
  },
} as const;

export type SupportedNodeType = keyof typeof nodePresentation;
