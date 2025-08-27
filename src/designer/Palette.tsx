import { mkNode } from "../lib/mkNode";
import type { AnyNode } from "../lib/schemaTypes";
import { useDesigner } from "../store/designer";
import { DND_MIME, type DragPayload } from "../lib/dnd";

const TYPES: AnyNode["type"][] = ["text", "number", "select", "checkbox", "section"];

export default function Palette() {
  const setSchema = useDesigner((s) => s.setSchema);

  const add = (type: AnyNode["type"]) =>
    setSchema((s) => ({ ...s, nodes: [...s.nodes, mkNode(type)] }));

  const onDragStart = (type: AnyNode["type"]) => (e: React.DragEvent) => {
    const payload: DragPayload = { kind: "create", type };
    e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="p-3 space-y-2">
      <div className="grid grid-cols-1 gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            draggable
            onDragStart={onDragStart(t)}
            onClick={() => add(t)}
            className="text-left p-2 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-800 cursor-grab active:cursor-grabbing"
            title="Drag to canvas or click to add"
          >
            <div className="font-medium capitalize">{t}</div>
            <div className="text-xs text-slate-500">Drag to canvas or click</div>
          </button>
        ))}
      </div>
    </div>
  );
}
