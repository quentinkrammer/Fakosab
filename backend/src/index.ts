import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import session from "express-session";
import memoryStore from "memorystore";
import passport from "passport";
import { env } from "../env.js";
import { authRouter } from "./authRouter.js";
import { createContext } from "./trcp/trpc.js";
import { trpcRouter } from "./trcp/trpcRouter.js";

const MemoryStore = memoryStore(session);

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    cookie: { maxAge: 1800000 },
    store: new MemoryStore({
      checkPeriod: 1800000,
    }),
    // not sure if this is needed
    saveUninitialized: false,
  }),
);
app.use(passport.authenticate("session"));
app.use("/auth", authRouter);
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: trpcRouter,
    createContext,
  }),
);
const server = app.listen(env.port);

// This is needed for HMR.
// This code hooks into the vite lifecycle and closes the server before HMR.
// Without closing the server HMR fails cause the port is alredy in use.
// https://github.com/vitest-dev/vitest/issues/2334
//@ts-ignore
const hot = import.meta.hot;
if (hot) {
  hot.on("vite:beforeFullReload", () => {
    server.close();
  });
}
hot.dispose(() => {
  server.close();
});
