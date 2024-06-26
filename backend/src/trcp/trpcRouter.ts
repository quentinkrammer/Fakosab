import { trpc } from "../trcp/trpc.js";
import { bookingRouter } from "./bookingRouter.js";
import { projectRouter } from "./projectRouter.js";
import { userRouter } from "./userRouter.js";

export const trpcRouter = trpc.router({
  users: userRouter,
  projects: projectRouter,
  bookings: bookingRouter,
});

export type AppRouter = typeof trpcRouter;
