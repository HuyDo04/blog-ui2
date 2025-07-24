import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
                silenceDeprecations: ["legacy-js-api", "mixed-decls"],
            },
        },
    },
    build: {
        minify: "terser",
        cssMinify: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ["react", "react-dom", "react-router-dom"],
                    components: ["./src/components/index.js"],
                },
            },
        },
    },
    server: {
        port: 5173,
        open: true,
    },
});
