import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";

export default defineConfig({
  server: {
    host: true,
    port: 8000,
  },
  plugins: [fresh()],
});
