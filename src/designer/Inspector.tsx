// src/designer/Inspector.tsx
import { useMemo } from "react";
import { useDesigner } from "../store/designer";
import type {
  AnyNode,
  TextNode,
  NumberNode,
  SelectNode,
  CheckboxNode,
  SectionNode,
} from "../lib/schemaTypes";

/** Patches cannot change the discriminant or id */
type NodePatch =
  | Partial<Omit<TextNode, "id" | "type">>
  | Partial<Omit<NumberNode, "id" | "type">>
  | Partial<Omit<SelectNode, "id" | "type">>
  | Partial<Omit<CheckboxNode, "id" | "type">>
  | Partial<Omit<SectionNode, "id" | "type">>;

/** Merge while preserving node.type (fixes TS union widening error) */
function mergeNode(n: AnyNode, patch: NodePatch): AnyNode {
  switch (n.type) {
    case "text":
      return { ...n, ...(patch as Partial<Omit<TextNode, "id" | "type">>) };
    case "number":
      return { ...n, ...(patch as Partial<Omit<NumberNode, "id" | "type">>) };
    case "select":
      return { ...n, ...(patch as Partial<Omit<SelectNode, "id" | "type">>) };
    case "checkbox":
      return { ...n, ...(patch as Partial<Omit<CheckboxNode, "id" | "type">>) };
    case "section":
      return { ...n, ...(patch as Partial<Omit<SectionNode, "id" | "type">>) };
    default:
      return n;
  }
}

export default function Inspector() {
  const schema     = useDesigner((s) => s.schema);
  const selectedId = useDesigner((s) => s.selectedId);
  const setSchema  = useDesigner((s) => s.setSchema);

  const idx = useMemo(
    () => schema.nodes.findIndex((n) => n.id === selectedId),
    [schema.nodes, selectedId]
  );
  const node = idx >= 0 ? schema.nodes[idx] : null;

  if (!node) {
    return <div className="text-sm text-slate-500">Select a field to edit</div>;
  }

  const update = (patch: NodePatch) =>
    setSchema((s) => {
      const nodes = s.nodes.slice();
      nodes[idx] = mergeNode(nodes[idx], patch);
      return { ...s, nodes };
    });

  return (
    <div className="space-y-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {node.type.toUpperCase()}
      </div>

      {/* Label */}
      <Field label="Label">
        <input
          className="w-full rounded border px-2 py-1 bg-white dark:bg-slate-950 dark:border-slate-800"
          value={node.label ?? ""}
          onChange={(e) => update({ label: e.target.value })}
        />
      </Field>

      {/* Required (not for section) */}
      {node.type !== "section" && (
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!(node as any).required}
            onChange={(e) => update({ required: e.target.checked } as NodePatch)}
          />
          Required
        </label>
      )}

      {/* Type-specific editors */}
      {node.type === "text" && (
        <>
          <Field label="Placeholder">
            <input
              className="w-full rounded border px-2 py-1 bg-white dark:bg-slate-950 dark:border-slate-800"
              value={(node as TextNode).placeholder ?? ""}
              onChange={(e) => update({ placeholder: e.target.value } as NodePatch)}
            />
          </Field>
          <Field label="Regex (optional)">
            <input
              className="w-full rounded border px-2 py-1 bg-white dark:bg-slate-950 dark:border-slate-800"
              value={(node as TextNode).regex ?? ""}
              onChange={(e) => update({ regex: e.target.value } as NodePatch)}
              placeholder="e.g. ^[A-Za-z]+$"
            />
          </Field>
        </>
      )}

      {node.type === "number" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Min">
            <input
              type="number"
              className="w-full rounded border px-2 py-1 bg-white dark:bg-slate-950 dark:border-slate-800"
              value={(node as NumberNode).min ?? ""}
              onChange={(e) =>
                update({
                  min: e.target.value === "" ? undefined : Number(e.target.value),
                } as NodePatch)
              }
            />
          </Field>
          <Field label="Max">
            <input
              type="number"
              className="w-full rounded border px-2 py-1 bg-white dark:bg-slate-950 dark:border-slate-800"
              value={(node as NumberNode).max ?? ""}
              onChange={(e) =>
                update({
                  max: e.target.value === "" ? undefined : Number(e.target.value),
                } as NodePatch)
              }
            />
          </Field>
        </div>
      )}

      {node.type === "select" && (
        <>
          <Field label="Options (comma-separated)">
            <input
              className="w-full rounded border px-2 py-1 bg-white dark:bg-slate-950 dark:border-slate-800"
              value={((node as SelectNode).options ?? []).join(", ")}
              onChange={(e) =>
                update({
                  options: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                } as NodePatch)
              }
              placeholder="Option A, Option B, Option C"
            />
          </Field>
          <Field label="Regex (optional)">
            <input
              className="w-full rounded border px-2 py-1 bg-white dark:bg-slate-950 dark:border-slate-800"
              value={(node as SelectNode).regex ?? ""}
              onChange={(e) => update({ regex: e.target.value } as NodePatch)}
              placeholder="e.g. ^(Option A|Option B)$"
            />
          </Field>
        </>
      )}

      {/* Visibility / Compute (not for section) */}
      {node.type !== "section" && (
        <>
          <Field label="Visible If (JS expression)">
            <input
              className="w-full rounded border px-2 py-1 bg-white dark:bg-slate-950 dark:border-slate-800 font-mono text-xs"
              value={(node as any).visibleIf ?? ""}
              onChange={(e) => update({ visibleIf: e.target.value } as NodePatch)}
              placeholder="e.g. values.age >= 18"
            />
          </Field>
          <Field label="Compute (JS expression)">
            <input
              className="w-full rounded border px-2 py-1 bg-white dark:bg-slate-950 dark:border-slate-800 font-mono text-xs"
              value={(node as any).compute ?? ""}
              onChange={(e) => update({ compute: e.target.value } as NodePatch)}
              placeholder="e.g. `${values.first} ${values.last}`"
            />
          </Field>
        </>
      )}

      {/* Section: show child count as hint */}
      {node.type === "section" && (
        <div className="text-xs text-slate-500">
          Children: {(node as SectionNode).children.length}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs block mb-1 text-slate-500">{label}</label>
      {children}
    </div>
  );
}
