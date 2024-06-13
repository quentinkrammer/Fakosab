
import { authedProcedure, trpc } from "./trpc.js";

export const trpcRouter = trpc.router({
    getFoo: authedProcedure.query(() => {
        return "Foo";
    }),
});

