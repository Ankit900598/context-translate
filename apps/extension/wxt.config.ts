import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Context Translate",
    description: "Right-click to translate selected text without leaving the page",
    version: "0.1.0",
    permissions: ["contextMenus", "storage", "activeTab", "scripting"],
    host_permissions: ["https://translation.googleapis.com/*"],
  },
  vite: () => ({
    resolve: {
      alias: {
        "@context-translate/core": new URL(
          "../../packages/core/src/index.ts",
          import.meta.url,
        ).pathname,
      },
    },
  }),
});
