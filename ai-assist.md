## AI Assistance (Summary)

I used an AI assistant to help with several **non-trivial** implementation and migration issues, plus some light design guidance:

-   **MSW v2 migration & setup** – Switched to `setupWorker` from `msw/browser`, adopted `http`/`HttpResponse`, and generated the service worker via `npx msw init public --save` to fix the blank-screen/MIME errors.
    
-   **React Query v5 API changes** – Replaced legacy `keepPreviousData: true` with `placeholderData: keepPreviousData` and updated query usage accordingly.
    
-   **Zustand v5 selector pitfalls** – Resolved “Expected 0–1 arguments” and infinite re-render issues by using a typed store, one-field selectors (no two-arg shallow), and splitting selectors to avoid object identity churn.
    
-   **TypeScript discriminated unions** – Fixed the Inspector update type error by merging patches with a `mergeNode` helper that preserves the `type` discriminant (no widening).
    
-   **Drag & drop in the Designer** – Implemented simple HTML5 DnD for adding and reordering fields without extra libraries.
    
-   **Responsive preview** – Added device presets (Mobile/Tablet/Laptop/Desktop) with a zoomable frame; styling inspiration borrowed from the assistant’s suggested layout.
    

I wrote the rest of the application structure, state logic, and UI glue, and I adapted all snippets to my codebase.

----------

## Challenges I Faced

-   **Runtime white screen** from a misconfigured service worker and import paths (MSW v2 vs v1).
    
-   **State re-render loops** due to returning new selector objects on every render (Zustand v5).
    
-   **Type errors** with discriminated unions when patching node data in the Inspector.
    
-   **Query behavior** not updating page size (URL state wasn’t triggering renders).
    
-   **Consistent UX** for form design (drag/add/reorder) and a clean responsive preview.
    

----------

## Design Inspiration

-   **Three-pane Designer** (Palette → Canvas → Inspector) with a simple toolbar (Undo/Redo, reordering).
    
-   **Subtle device “frame”** in Preview with a small top bezel and zoom control.
    
-   **Clean data grid** with inline edit fields and status badges for quick scanning.
    

I customized the visuals and interactions to fit the assignment while using the assistant’s suggestions as a starting point.