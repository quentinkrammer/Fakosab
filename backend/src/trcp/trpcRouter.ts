import { trpc } from "../trcp/trpc.js";
import { projectRouter } from "./projectRouter.js";
import { userRouter } from "./userRouter.js";

export const trpcRouter = trpc.router({
  users: userRouter,
  projects: projectRouter,
});

export type AppRouter = typeof trpcRouter;
