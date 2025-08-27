import { setupWorker } from "msw/browser";
import { http, HttpResponse } from "msw";

type Row = {
  id: number;
  name: string;
  email: string;
  role: "User" | "Admin" | "Editor";
  status: "Active" | "Inactive" | "Pending";
  created: string;
  last: string;
};

const ROLES = ["User","Admin","Editor"] as const;
const STATUSES = ["Active","Inactive","Pending"] as const;

// In-memory dataset (10k+)
const DATA: Row[] = Array.from({ length: 10247 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ROLES[(i + 1) % ROLES.length],
  status: STATUSES[(i + 1) % STATUSES.length],
  created: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
  last:    new Date(2025, i % 12, ((i + 7) % 28) + 1).toISOString(),
}));

// Simple schema persistence (localStorage)
const SCHEMA_KEY = "schema-console:schema";
const getSchema = () => {
  try { return JSON.parse(localStorage.getItem(SCHEMA_KEY) || "null"); }
  catch { return null; }
};

export const worker = setupWorker(
  http.get("/api/rows", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const size = Number(url.searchParams.get("size") ?? 20);
    const q    = (url.searchParams.get("q") ?? "").toLowerCase();
    const sort = url.searchParams.get("sort") ?? "id";
    const dir  = (url.searchParams.get("dir") ?? "asc") as "asc" | "desc";

    let rows = DATA;
    if (q) rows = rows.filter(r => `${r.id}${r.name}${r.email}${r.role}${r.status}`.toLowerCase().includes(q));

    rows = [...rows].sort((a: any, b: any) => {
      const av = a[sort], bv = b[sort];
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });

    const total = rows.length;
    const start = (page - 1) * size;
    const slice = rows.slice(start, start + size);

    return HttpResponse.json({ total, rows: slice }, { status: 200 });
  }),

  http.patch("/api/rows/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const update = (await request.json()) as Partial<Row>;
    const idx = DATA.findIndex(r => r.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    DATA[idx] = { ...DATA[idx], ...update };
    return HttpResponse.json({ ok: true, row: DATA[idx] }, { status: 200 });
  }),

  http.get("/api/schema", () => HttpResponse.json({ schema: getSchema() }, { status: 200 })),
  http.put("/api/schema", async ({ request }) => {
    const { schema } = (await request.json()) as any;
    localStorage.setItem(SCHEMA_KEY, JSON.stringify(schema));
    return new HttpResponse(null, { status: 204 });
  })
);
