
Schema Console
==============

A small, type-safe front-end that lets you **design forms**, **preview them responsively**, and **browse/edit mock data** — built with React + TypeScript, Zustand, Zod + React Hook Form, React Query v5, and MSW v2.

Features
----------

*   **Form Designer**
    
    *   Palette → drag to Canvas (HTML5 DnD)
        
    *   Reorder by drag or toolbar ↑/↓
        
    *   Inspector for label, required, regex, min/max, options, visibility & compute expressions
        
    *   Undo / Redo
        
    *   Save schema (mocked API → localStorage)
        
*   **Responsive Preview**
    
    *   Device presets: **Mobile / Tablet / Laptop / Desktop**
        
    *   Zoom 50–150%
        
    *   Live validation with **Zod** + **react-hook-form**
        
*   **Data Grid**
    
    *   Server-style pagination, sort, search
        
    *   Inline edits (PATCH)
        
    *   Backed by **MSW v2** mock API (10k+ rows)
        
*   **Type-safe state**
    
    *   **Zustand v5** store with history (undo/redo)
        
    *   Discriminated unions for schema nodes
        

Tech Stack
-------------

*   React + TypeScript (Vite)
    
*   Zustand v5 (typed selectors)
    
*   Zod, React Hook Form, @hookform/resolvers
    
*   @tanstack/react-query v5
    
*   MSW v2 (msw/browser, http, HttpResponse)
    
*   Tailwind CSS (optional but supported)
    

Getting Started
------------------

### 1) Install dependencies

`   npm i     `

If you’re setting up from scratch, ensure these are installed:

```
 npm i zustand zod react-hook-form @hookform/resolvers @tanstack/react-query msw   `
```
### 2) Initialize MSW (one-time)

```
 npx msw init public --save   `
```
This creates public/mockServiceWorker.js, which the app starts in dev.

### 3) Run dev

`   npm run dev   `

Open the printed localhost URL.

Scripts
----------

```
{    
	"scripts": 
		{      "dev": "vite",      
				"build": "vite build",      
				"preview": "vite preview",      
				"typecheck": "tsc --noEmit"    
		}  
}
```
Mock API (MSW v2)
--------------------

Defined in src/mocks/msw.ts:
```
*   GET /api/rows?page=&size=&q=&sort=&dir= → paginated grid data (10k+ rows)
    
*   PATCH /api/rows/:id → inline edits
    
*   GET /api/schema → returns saved schema (from localStorage)
    
*   PUT /api/schema → saves schema
    
```
Dev-only start (in main.tsx):
```
 await worker.start({    onUnhandledRequest: "bypass",    serviceWorker: { url: "/mockServiceWorker.js" },    quiet: true  });   `
```
Form Designer
----------------

*   **Add fields**: Drag from **Palette** to **Canvas**, or click to append.
    
*   **Reorder**: Drag within Canvas or use toolbar **↑/↓**.
    
*   **Edit**: Select a node → use **Inspector**.
    
    *   Text: label, placeholder, regex
        
    *   Number: min/max
        
    *   Select: comma-separated options, regex
        
    *   All (non-section): required, visibleIf, compute
        
*   **Undo / Redo**: Toolbar controls.
    
*   **Save**: “Save Form” → PUT /api/schema (mocked → localStorage).
    

Schema types live in lib/schemaTypes.ts (discriminated unions).

Responsive Preview
---------------------

*   Rendered by preview/PreviewForm.tsx using your schema.
    
*   **Validation**:
    
    *   Text/select: z.string() + optional regex + required rules.
        
    *   Number: z.coerce.number().refine(Number.isFinite) + min/max.
        
    *   Checkbox: z.boolean() + required true if set.
        
*   **visibleIf** / **compute**:
    
    *   visibleIf: JS expression with values (e.g., values.age >= 18).
        
    *   compute: JS expression; result is written to the field.
        
*   Expressions are executed via a tiny wrapper; invalid expressions fail silently.
    

Data Grid
------------

*   URL-driven state: page, size, q, sort, dir.
    
*   React Query v5 with placeholderData: keepPreviousData.
    
*   MSW v2 handlers provide realistic server behavior.
    

**Tip:** Pagination size is **controlled state**; changing to 100 will fetch 100 rows immediately.

Type & Version Notes
-----------------------

*   **Zustand v5**
    
    *   Prefer one-field selectors: useDesigner(s => s.schema) to avoid equality pitfalls.
        
    *   useStore(selector, { equalityFn: shallow });
        
*   **React Query v5**
    
    *   Use placeholderData: keepPreviousData (not the v4 boolean).
        
*   **MSW v2**
    
    *   setupWorker from "msw/browser".
        
    *   Handlers from msw: http, HttpResponse (no rest).
        
 Troubleshooting
------------------

*   **Blank screen** Check browser console; ensure your main.tsx renders the app **before** starting MSW and that public/mockServiceWorker.js exists.
    
*   **MSW MIME/type error** Re-run npx msw init public --save; verify the worker file path and that dev server serves it.
    
*   **Zustand “Expected 0–1 arguments”** You’re on v5; don’t pass (selector, shallow) — use { equalityFn: shallow } or split selectors.
    
*   **React Query keep Previous Data error** Use placeholderData: keepPreviousData.

Deploy
---------

This project is dev-focused (MSW). For production hosting (e.g., Vercel/Netlify):

``` 
npm run build  
```