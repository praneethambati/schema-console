import { useMemo, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Designer from "./pages/Designer";
import Preview from "./pages/preview";
import DataGrid from "./pages/DataGrid";

type RouteKey = "dashboard" | "designer" | "preview" | "grid";

export default function App() {
  const [route, setRoute] = useState<RouteKey>("dashboard");
  const title = useMemo(() => {
    switch (route) {
      case "dashboard":
      case "designer":
      case "preview":
      case "grid":
        return "Schema Console";
    }
  }, [route]);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="h-14 border-b bg-white/80 backdrop-blur sticky top-0 z-40 flex items-center px-4 justify-between dark:bg-slate-900/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-600 grid place-items-center text-white font-bold">S</div>
          <div className="font-semibold">{title}</div>
        </div>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
      </header>

      <div className="grid grid-cols-[260px_1fr]">
        <aside className="min-h-[calc(100vh-56px)] border-r bg-white p-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="text-sm font-semibold px-2 mb-2">Schema Console</div>
          <NavGroup label="Core">
            <NavItem active={route==="dashboard"} onClick={()=>setRoute("dashboard")} label="Dashboard" />
            <NavItem active={route==="designer"} onClick={()=>setRoute("designer")} label="Form Designer" />
            <NavItem active={route==="preview"} onClick={()=>setRoute("preview")} label="Preview" />
            <NavItem active={route==="grid"} onClick={()=>setRoute("grid")} label="Data Grid" />
          </NavGroup>
        </aside>

        <main className="p-6">
          {route === "dashboard" && <Dashboard />}
          {route === "designer" && <Designer />}
          {route === "preview" && <Preview />}
          {route === "grid" && <DataGrid />}
        </main>
      </div>
    </div>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 px-2 mb-2">{label}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function NavItem({ active, label, onClick }:{
  active?: boolean; label: string; onClick?: ()=>void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-2 rounded-md transition ${
        active
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
          : "hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      <div className="font-medium text-sm">{label}</div>
    </button>
  );
}
