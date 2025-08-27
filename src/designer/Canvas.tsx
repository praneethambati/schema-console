import { useState } from "react";
import { useDesigner } from "../store/designer";
import type { AnyNode } from "../lib/schemaTypes";
import { DND_MIME, type DragPayload } from "../lib/dnd";
import { mkNode } from "../lib/mkNode";

export default function Canvas() {
  const schema     = useDesigner((s) => s.schema);
  const setSchema  = useDesigner((s) => s.setSchema);
  const select     = useDesigner((s) => s.select);
  const selectedId = useDesigner((s) => s.selectedId);

  const [overIndex, setOverIndex] = useState<number | null>(null);

  const insertAt = (idx: number, n: AnyNode) =>
    setSchema((s) => {
      const nodes = s.nodes.slice();
      nodes.splice(idx, 0, n);
      return { ...s, nodes };
    });

  const moveItem = (from: number, to: number) =>
    setSchema((s) => {
      const nodes = s.nodes.slice();
      const [item] = nodes.splice(from, 1);
      nodes.splice(to, 0, item);
      return { ...s, nodes };
    });

  const onDragOverCanvas = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(DND_MIME)) return;
    e.preventDefault();
    if (schema.nodes.length === 0) setOverIndex(0);
  };

  const onDropCanvas = (e: React.DragEvent) => {
    const raw = e.dataTransfer.getData(DND_MIME);
    if (!raw) return;
    e.preventDefault();
    let payload: DragPayload;
    try { payload = JSON.parse(raw); } catch { return; }

    const idx = overIndex ?? schema.nodes.length;

    if (payload.kind === "create") {
      insertAt(clamp(idx, 0, schema.nodes.length), mkNode(payload.type));
    } else if (payload.kind === "move") {
      const from = clamp(payload.index, 0, schema.nodes.length - 1);
      const to = clamp(idx, 0, schema.nodes.length);
      if (from !== to && from >= 0) moveItem(from, to > from ? to - 1 : to);
    }
    setOverIndex(null);
  };

  const onDragStartItem = (index: number) => (e: React.DragEvent) => {
    const payload: DragPayload = { kind: "move", index };
    e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOverItem = (index: number) => (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(DND_MIME)) return;
    e.preventDefault();
    setOverIndex(index);
  };

  const onDropOnItem = (index: number) => (e: React.DragEvent) => {
    const raw = e.dataTransfer.getData(DND_MIME);
    if (!raw) return;
    e.preventDefault();
    let payload: DragPayload;
    try { payload = JSON.parse(raw); } catch { return; }

    const targetIdx = clamp(index, 0, schema.nodes.length);

    if (payload.kind === "create") {
      insertAt(targetIdx, mkNode(payload.type));
    } else if (payload.kind === "move") {
      const from = clamp(payload.index, 0, schema.nodes.length - 1);
      const to = targetIdx;
      if (from !== to && from >= 0) moveItem(from, to > from ? to - 1 : to);
    }
    setOverIndex(null);
  };

  return (
    <div
      className="p-3 space-y-2"
      onDragOver={onDragOverCanvas}
      onDrop={onDropCanvas}
      onDragLeave={() => setOverIndex(null)}
    >
      {schema.nodes.length === 0 && <EmptyHint />}

      {schema.nodes.map((n, i) => (
        <div key={n.id}>
          {overIndex === i && <DropIndicator />}
          <NodeCard
            n={n}
            selected={selectedId === n.id}
            onSelect={() => select(n.id)}
            onDragStartItem={onDragStartItem(i)}
            onDragOverItem={onDragOverItem(i)}
            onDropOnItem={onDropOnItem(i)}
          />
        </div>
      ))}
      {overIndex === schema.nodes.length && <DropIndicator />}
    </div>
  );
}

function NodeCard({
  n,
  selected,
  onSelect,
  onDragStartItem,
  onDragOverItem,
  onDropOnItem,
}: {
  n: AnyNode;
  selected?: boolean;
  onSelect: () => void;
  onDragStartItem: (e: React.DragEvent) => void;
  onDragOverItem: (e: React.DragEvent) => void;
  onDropOnItem: (e: React.DragEvent) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      draggable
      onDragStart={onDragStartItem}
      onDragOver={onDragOverItem}
      onDrop={onDropOnItem}
      className={`p-2 rounded border cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 ${
        selected ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/40" : "border-slate-300 dark:border-slate-700"
      }`}
      aria-label={`Drag to reorder: ${n.label}`}
      title="Drag to reorder"
    >
      <div className="text-xs opacity-60 capitalize">{n.type}</div>
      <div className="font-medium">{n.label}</div>
    </div>
  );
}

function DropIndicator() {
  return (
    <div className="h-3 my-1">
      <div className="h-0.5 bg-blue-500 rounded" />
    </div>
  );
}
function EmptyHint() {
  return (
    <div className="text-sm text-slate-500 border rounded-lg p-10 text-center dark:border-slate-800">
      <div className="font-medium mb-1">Drag fields here</div>
      <div>…or click a field in the palette to add it</div>
    </div>
  );
}
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
