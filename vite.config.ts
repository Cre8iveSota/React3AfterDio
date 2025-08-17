import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react-swc";
import restart from "vite-plugin-restart";

export default defineConfig({
  publicDir: "./public",
  plugins: [
    // public フォルダの変更で再起動
    restart({ restart: ["./public/**"] }),

    // React + SWC
    react(),

    // .js を JSX として扱う（Windows/Linux 両対応のパス判定）
    {
      name: "load+transform-js-files-as-jsx",
      async transform(code: string, id: string) {
        if (!/[/\\]src[/\\].*\.js$/.test(id)) return null;
        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic",
        });
      },
    },
  ],
  server: {
    host: true,
    open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
