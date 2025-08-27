export const DND_MIME = "application/x-schema-node";

export type DragPayload =
  | { kind: "create"; type: "text" | "number" | "select" | "checkbox" | "section" }
  | { kind: "move"; index: number };
