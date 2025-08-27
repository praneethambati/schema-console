import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

type Row = {
  id: number;
  name: string;
  email: string;
  role: "User" | "Admin" | "Editor";
  status: "Active" | "Inactive" | "Pending";
  created: string;
  last: string;
};

function useQueryState() {
  const params = new URLSearchParams(location.search);
  const get = (k: string, d: string) => params.get(k) ?? d;
  const set = (obj: Record<string, string>) => {
    const p = new URLSearchParams(location.search);
    Object.entries(obj).forEach(([k, v]) => p.set(k, v));
    history.replaceState(null, "", `?${p.toString()}`);
    window.dispatchEvent(new Event("popstate"));
  };
  return {
    page: Number(get("page", "1")),
    size: Number(get("size", "20")),
    q: get("q", ""),
    sort: get("sort", "id"),
    dir: (get("dir", "asc") as "asc" | "desc"),
    set,
  };
}

export default function DataGrid() {
  const qs = useQueryState();
  const key = ["rows", qs.page, qs.size, qs.q, qs.sort, qs.dir] as const;

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const url = `/api/rows?page=${qs.page}&size=${qs.size}&q=${encodeURIComponent(qs.q)}&sort=${qs.sort}&dir=${qs.dir}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error("fetch failed");
      return (await r.json()) as { total: number; rows: Row[] };
    },
    placeholderData: keepPreviousData,
  });

  const qc = useQueryClient();
  const patch = useMutation({
    mutationFn: async ({ id, update }: { id: number; update: Partial<Row> }) => {
      const r = await fetch(`/api/rows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!r.ok) throw new Error("patch failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  useEffect(() => {
    const fn = () => {};
    window.addEventListener("popstate", fn);
    return () => window.removeEventListener("popstate", fn);
  }, []);

  const total = data?.total ?? 0;
  const rows = data?.rows ?? [];
  const pageCount = Math.ceil(Math.max(total, 1) / qs.size);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Data Grid</h1>
        <div className="ml-auto flex items-center gap-2">
          <button className="px-3 py-2 rounded-md border bg-white dark:bg-slate-900 dark:border-slate-800">Import</button>
          <button className="px-3 py-2 rounded-md border bg-white dark:bg-slate-900 dark:border-slate-800">Export</button>
          <button className="px-3 py-2 rounded-md bg-indigo-600 text-white">+ Add Record</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-3 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <input
            placeholder="Search all columns..."
            className="flex-1 rounded-md border px-3 py-2 bg-white dark:bg-slate-950 dark:border-slate-800"
            defaultValue={qs.q}
            onChange={(e) => qs.set({ q: e.target.value, page: "1" })}
          />
          <select
            className="rounded-md border px-3 py-2 bg-white dark:bg-slate-950 dark:border-slate-800"
            defaultValue={qs.size}
            onChange={(e) => qs.set({ size: e.target.value, page: "1" })}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}/page</option>
            ))}
          </select>
          <button className="px-3 py-2 rounded-md border bg-white dark:bg-slate-900 dark:border-slate-800" onClick={() => location.reload()}>
            Refresh
          </button>
        </div>

        <div className="overflow-auto rounded-lg border dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
              <tr>
                {["id","name","email","role","status","created","last"].map((h) => (
                  <Th key={h} active={qs.sort===h} dir={qs.dir} onSort={()=>{
                    const dir = qs.sort===h && qs.dir==="asc" ? "desc" : "asc";
                    qs.set({ sort:h, dir, page: "1" });
                  }}>{h.toUpperCase()}</Th>
                ))}
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td className="p-6 text-center text-slate-500" colSpan={8}>Loading…</td></tr>}
              {!isLoading && rows.map((r, i)=>(
                <tr key={r.id} className={i%2 ? "bg-white dark:bg-slate-900" : "bg-slate-50/30 dark:bg-slate-950"}>
                  <Td>{r.id}</Td>
                  <EditableTd value={r.name}  onBlur={(v)=>patch.mutate({ id:r.id, update:{ name:v }})} />
                  <EditableTd value={r.email} onBlur={(v)=>patch.mutate({ id:r.id, update:{ email:v }})} />
                  <Td><Badge tone="slate">{r.role}</Badge></Td>
                  <Td><Badge tone={r.status==="Active"?"green":r.status==="Pending"?"amber":"slate"}>{r.status}</Badge></Td>
                  <Td>{new Date(r.created).toLocaleDateString()}</Td>
                  <Td>{new Date(r.last).toLocaleDateString()}</Td>
                  <Td><div className="flex gap-2"><IconBtn>✏️</IconBtn><IconBtn>🗑️</IconBtn><IconBtn>⋯</IconBtn></div></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3 text-sm">
          <span className="text-slate-500">Page {qs.page} of {pageCount || 1}</span>
          <button disabled={qs.page<=1} onClick={()=>qs.set({ page: String(qs.page-1) })} className="px-3 py-1.5 rounded-md border disabled:opacity-50">Prev</button>
          <button disabled={qs.page>=pageCount} onClick={()=>qs.set({ page: String(qs.page+1) })} className="px-3 py-1.5 rounded-md border disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}

function Th({ children, active, dir, onSort }:{
  children: React.ReactNode; active?: boolean; dir?: "asc"|"desc"; onSort?: ()=>void;
}) {
  return (
    <th className="text-left font-medium px-3 py-2 select-none">
      <button onClick={onSort} className={`inline-flex items-center gap-1 ${active ? "text-indigo-600" : ""}`}>
        {children} {active ? (dir==="asc" ? "↑" : "↓") : ""}
      </button>
    </th>
  );
}
function Td({ children, className="" }:{ children:React.ReactNode; className?:string; }) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}
function EditableTd({ value, onBlur }:{ value:string; onBlur:(v:string)=>void; }) {
  return (
    <Td>
      <input
        defaultValue={value}
        onBlur={(e)=>onBlur(e.target.value)}
        className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded px-2 py-1"
      />
    </Td>
  );
}
function Badge({ children, tone="slate" }:{ children:React.ReactNode; tone?:"green"|"amber"|"slate"; }) {
  const map = {
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  } as const;
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[tone]}`}>{children}</span>;
}
function IconBtn({ children }:{ children:React.ReactNode }) {
  return <button className="px-2 py-1 rounded-md border bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800">{children}</button>;
}
