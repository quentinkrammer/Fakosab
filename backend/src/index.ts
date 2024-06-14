import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import session from "express-session";
import memoryStore from "memorystore";
import passport from "passport";
import { env } from "../env.js";
import { authRouter } from "./authRouter.js";
import { createContext } from "./trpc.js";
import { trpcRouter } from "./trpcRouter.js";

const MemoryStore = memoryStore(session);

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    cookie: { maxAge: 3600000 },
    store: new MemoryStore({
      checkPeriod: 3600000,
    }),
    // not sure if this is needed
    saveUninitialized: false,
  }),
);
app.use(passport.authenticate("session"));
app.use("/", authRouter);
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: trpcRouter,
    createContext,
  }),
);
app.listen(env.port);
