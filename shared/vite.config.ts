import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  console.log("Command: ", command);
  console.log("Mode: ", mode);
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    define: { __APP_ENV__: JSON.stringify(env["APP_ENV"]) },
    build: {
      lib: {
        entry: resolve(__dirname, "index.ts"),
        name: "shared",
      },
    },
  };
});
