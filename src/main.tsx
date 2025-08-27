import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { worker } from "./mocks/msw";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Start MSW after render (dev only)
(async () => {
  try {
    if (import.meta.env.DEV && worker?.start) {
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: { url: "/mockServiceWorker.js" },
        quiet: true,
      });
      console.log("[MSW] worker started");
    }
  } catch (e) {
    console.error("[MSW] failed to start", e);
  }
})();
