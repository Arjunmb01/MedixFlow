/**
 * Fast dev server: esbuild bundles src/ once (~1-3s) instead of tsx compiling
 * hundreds of files on every cold start (~20-30s on Windows/OneDrive).
 */
import * as esbuild from "esbuild";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outdir = resolve(root, ".dev");
const outfile = resolve(outdir, "server.cjs");

if (!existsSync(outdir)) {
  mkdirSync(outdir, { recursive: true });
}

let nodeProcess = null;

function startNode() {
  if (nodeProcess) {
    nodeProcess.kill("SIGTERM");
    nodeProcess = null;
  }
  nodeProcess = spawn(process.execPath, ["--enable-source-maps", outfile], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "development" },
  });
  nodeProcess.on("exit", (code) => {
    if (code !== null && code !== 0 && code !== 143) {
      process.exitCode = code;
    }
  });
}

const ctx = await esbuild.context({
  entryPoints: [resolve(root, "src/server.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile,
  format: "cjs",
  sourcemap: true,
  packages: "external",
  alias: {
    "@": resolve(root, "src"),
  },
  logLevel: "info",
  plugins: [
    {
      name: "restart-on-rebuild",
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length > 0) return;
          console.log("\n[esbuild] Bundle ready — starting server...\n");
          startNode();
        });
      },
    },
  ],
});

console.log("[esbuild] Watching src/ for changes...\n");
await ctx.watch();

process.on("SIGINT", () => {
  if (nodeProcess) nodeProcess.kill("SIGTERM");
  process.exit(0);
});
