import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  console.log("Command: ", command);
  console.log("Mode: ", mode);
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    define: { __APP_ENV__: JSON.stringify(env["APP_ENV"]) },
  };
});
