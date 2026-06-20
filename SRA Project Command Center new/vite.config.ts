// Build statis (SPA) untuk ditempel ke dalam app utama (kiro) di /commandcenter.
// - nitro: false  → tanpa server Node, output Vite statis murni.
// - tanstackStart.spa.enabled → prerender shell jadi index.html (client-only).
// - vite.base '/commandcenter/' → semua asset & route jalan saat di-host di subfolder.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  vite: {
    base: "/commandcenter/",
  },
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true },
  },
});
