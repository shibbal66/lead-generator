import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/** SPA route paths that must not be resolved to source files (e.g. /app → App.tsx on case-insensitive FS). */
const SPA_ROUTES = ["/app", "/login", "/signup", "/sign-up", "/forgot-password", "/reset-password"];

export default defineConfig(({ mode }) =>
{
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0"
    },
    preview: {
      allowedHosts: ["www.leadgenerator.nexus-ethica.com"]
    },
    plugins: [
      {
        name: "spa-fallback-routes",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const pathname = req.url?.split("?")[0] ?? "";
            if (SPA_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
              req.url = "/index.html";
            }
            next();
          });
        }
      },
      react()
    ],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, ".")
      }
    }
  };
});


