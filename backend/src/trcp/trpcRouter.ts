import { trpc } from "../trcp/trpc.js";
import { userRouter } from "./userRouter.js";

export const trpcRouter = trpc.router({ users: userRouter });

export type AppRouter = typeof trpcRouter;
