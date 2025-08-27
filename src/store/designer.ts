import { create } from "zustand";
import type { AnyNode } from "../lib/schemaTypes";

export type Schema = { title: string; nodes: AnyNode[] };

export type DesignerState = {
  schema: Schema;
  selectedId: string | null;

  setSchema: (updater: (s: Schema) => Schema) => void;
  select: (id: string | null) => void;

  _past: Schema[];
  _future: Schema[];
  undo: () => void;
  redo: () => void;
};

const initialSchema: Schema = { title: "My Form", nodes: [] };

export const useDesigner = create<DesignerState>()((set, get) => ({
  schema: initialSchema,
  selectedId: null,

  setSchema: (updater) => {
    const prev = get().schema;
    const next = updater(prev);
    if (next === prev) return;
    set((state) => ({
      schema: next,
      _past: [...state._past, prev],
      _future: [],
    }));
  },

  select: (id) => set({ selectedId: id }),

  _past: [],
  _future: [],
  undo: () => {
    const { _past, schema, _future } = get();
    if (_past.length === 0) return;
    const last = _past[_past.length - 1];
    set({ schema: last, _past: _past.slice(0, -1), _future: [schema, ..._future] });
  },
  redo: () => {
    const { _future, schema, _past } = get();
    if (_future.length === 0) return;
    const [next, ...rest] = _future;
    set({ schema: next, _past: [..._past, schema], _future: rest });
  },
}));
