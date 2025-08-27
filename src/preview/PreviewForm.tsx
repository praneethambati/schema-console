import { useEffect, useMemo } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useDesigner } from "../store/designer";
import type { AnyNode } from "../lib/schemaTypes";
import { isVisible, evalExpr } from "../lib/expr";

function buildSchema(fields: AnyNode[]) {
  const entries: [string, z.ZodTypeAny][] = [];

  for (const f of fields) {
    if (f.type === "section") continue;

    let s: z.ZodTypeAny;

    if (f.type === "number") {
      const min = (f as any).min;
      const max = (f as any).max;
      let bounded = z.number();
      if (typeof min === "number") bounded = bounded.min(min);
      if (typeof max === "number") bounded = bounded.max(max);
      s = z.coerce.number().refine(Number.isFinite, "Invalid number").pipe(bounded);
    } else if (f.type === "checkbox") {
      s = z.boolean();
    } else {
      s = z.string();
      const rx = (f as any).regex;
      if (rx) {
        try { s = (s as z.ZodString).regex(new RegExp(rx), "Invalid format"); } catch {}
      }
    }

    if (f.required) {
      s =
        f.type === "checkbox"
          ? (s as z.ZodBoolean).refine((v) => v === true, "Required")
          : s.refine((v) => v !== "" && v !== undefined && v !== null, "Required");
    }

    entries.push([f.id, s]);
  }

  return z.object(Object.fromEntries(entries) as Record<string, z.ZodTypeAny>);
}

function buildDefaults(fields: AnyNode[]) {
  const d: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "section") continue;
    if (f.type === "checkbox") d[f.id] = false;
    else if (f.type === "number") d[f.id] = undefined;
    else d[f.id] = "";
  }
  return d;
}

export default function PreviewForm() {
  const nodes = useDesigner((s) => s.schema.nodes);
  const fields = useMemo(() => nodes.filter((n) => n.type !== "section"), [nodes]);

  const schema = useMemo(() => buildSchema(fields), [fields]);
  const defaultValues = useMemo(() => buildDefaults(fields), [fields]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: "onChange",
  });

  const values = form.watch();

  useEffect(() => {
    nodes.forEach((f) => {
      if (f.type === "section" || !f.compute) return;
      const v = evalExpr(f.compute, values);
      if (v !== undefined) form.setValue(f.id as any, v as any, { shouldDirty: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  function Field({ f }: { f: AnyNode }) {
    if (f.type === "section") return null;
    if (!isVisible(f.visibleIf, values)) return null;

    const err = form.formState.errors[f.id as keyof typeof form.formState.errors];

    if (f.type === "checkbox") {
      return (
        <div className="mb-4">
          <label className="mr-2">
            <Controller
              name={f.id as any}
              control={form.control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <span className="ml-2">{f.label}</span>
          </label>
          {err && <p role="alert" className="text-sm text-red-600 mt-1">{(err as any).message}</p>}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label htmlFor={f.id} className="block mb-1 font-medium">{f.label}</label>

        {f.type === "text" && (
          <input
            id={f.id}
            {...form.register(f.id as any)}
            placeholder={(f as any).placeholder}
            className="px-2 py-1 border rounded w-full bg-white dark:bg-slate-950 dark:border-slate-800"
            aria-invalid={!!err}
          />
        )}

        {f.type === "number" && (
          <input
            id={f.id}
            type="number"
            {...form.register(f.id as any)}
            className="px-2 py-1 border rounded w-full bg-white dark:bg-slate-950 dark:border-slate-800"
            aria-invalid={!!err}
          />
        )}

        {f.type === "select" && (
          <select
            id={f.id}
            {...form.register(f.id as any)}
            className="px-2 py-1 border rounded w-full bg-white dark:bg-slate-950 dark:border-slate-800"
            aria-invalid={!!err}
          >
            <option value="">-- choose --</option>
            {((f as any).options ?? []).map((o: string) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        )}

        {err && <p role="alert" className="text-sm text-red-600 mt-1">{(err as any).message}</p>}
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="flex gap-6 p-3">
        <form className="space-y-3 max-w-xl">
          {nodes.map((n) => <Field key={n.id} f={n} />)}
          <button
            type="button"
            onClick={form.handleSubmit((d) => alert(JSON.stringify(d, null, 2)))}
            className="px-4 py-2 rounded bg-emerald-600 text-white"
          >
            Submit
          </button>
        </form>
        <pre className="p-3 bg-slate-900/70 text-slate-100 rounded overflow-auto max-h-[60vh] min-w-[320px]">
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    </FormProvider>
  );
}
