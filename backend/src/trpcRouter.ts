
import { authedProcedure, trpc } from "./trpc";

export const trpcRouter = trpc.router({
    getFoo: authedProcedure.query(() => {
        return "Foo";
    }),
});

