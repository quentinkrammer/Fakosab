import { trpc } from "../trpc.js";
import { userRouter } from "./userRouter.js";

export const trpcRouter = trpc.router({ users: userRouter });

export type AppRouter = typeof trpcRouter;
