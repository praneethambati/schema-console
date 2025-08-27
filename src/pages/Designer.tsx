import Palette from "../designer/Palette";
import Canvas from "../designer/Canvas";
import Inspector from "../designer/Inspector";
import { useDesigner } from "../store/designer";

function ToolbarBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={
        "px-2 py-1 rounded-md border text-slate-700 hover:bg-slate-50 " +
        "dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 " +
        className
      }
    />
  );
}

function ReorderButtons() {
  const schema     = useDesigner((s) => s.schema);
  const setSchema  = useDesigner((s) => s.setSchema);
  const selectedId = useDesigner((s) => s.selectedId);

  const move = (delta: number) => {
    const i = schema.nodes.findIndex((n) => n.id === selectedId);
    if (i < 0) return;
    const j = Math.max(0, Math.min(schema.nodes.length - 1, i + delta));
    if (i === j) return;

    setSchema((s) => {
      const nodes = s.nodes.slice();
      const [it] = nodes.splice(i, 1);
      nodes.splice(j, 0, it);
      return { ...s, nodes };
    });
  };

  return (
    <div className="flex gap-1">
      <ToolbarBtn onClick={() => move(-1)} title="Move up">↑</ToolbarBtn>
      <ToolbarBtn onClick={() => move(1)} title="Move down">↓</ToolbarBtn>
    </div>
  );
}

export default function Designer() {
  const schema = useDesigner((s) => s.schema);
  const undo   = useDesigner((s) => s.undo);
  const redo   = useDesigner((s) => s.redo);

  const handleSave = async () => {
    await fetch("/api/schema", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema }),
    });
    alert("Schema saved ✅");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <ToolbarBtn onClick={undo}>↺ Undo</ToolbarBtn>
          <ToolbarBtn onClick={redo}>↻ Redo</ToolbarBtn>
          <div className="mx-2 h-6 w-px bg-slate-300 dark:bg-slate-800" />
          <ReorderButtons />
        </div>
        <button onClick={handleSave} className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">
          Save Form
        </button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_300px] gap-4">
        <div className="bg-white rounded-xl border p-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="font-semibold mb-2">Field Components</div>
          <Palette />
        </div>

        <div className="bg-white rounded-xl border p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="font-semibold mb-2">Form Designer Canvas</div>
          <Canvas />
        </div>

        <div className="bg-white rounded-xl border p-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="font-semibold mb-2">Field Properties</div>
          <Inspector />
        </div>
      </div>
    </div>
  );
}
