import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O front e servido pelo Cloudflare Pages a partir de client/dist.
// Em desenvolvimento, /api vai para o `wrangler pages dev` na 8788, para as
// telas falarem com as Functions de verdade em vez de dados de mentira.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8788",
    },
  },
});
