import type { AnyNode } from "./schemaTypes";

export function mkNode(type: AnyNode["type"]): AnyNode {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (type === "section") return { id, type, label: "Section", children: [] } as AnyNode;
  if (type === "select")  return { id, type, label: "Select field", options: ["Option A", "Option B"] } as AnyNode;
  if (type === "checkbox")return { id, type, label: "Checkbox" } as AnyNode;
  if (type === "number")  return { id, type, label: "Number", min: 0, max: 100 } as AnyNode;
  return { id, type, label: "Text field", placeholder: "Enter text" } as AnyNode;
}
