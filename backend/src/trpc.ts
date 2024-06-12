import { TRPCError, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import z from "zod"

const userSchema = z.object({
    username: z.string(),
    role: z.optional(z.literal('admin')),
    userId: z.number()
})
export const createContext = ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) => {
    const user = process.env['NODE_ENV'] === 'development' ?
        { username: 'DevEnvUser', 'role': 'admin', 'userId': 42 } : req.user

    const { data } = userSchema.safeParse(user)
    return ({
        user: data
    })
}
type Context = Awaited<ReturnType<typeof createContext>>;

export const trpc = initTRPC.context<Context>().create();

export const authedProcedure = trpc.procedure.use(async function isAuthed(opts) {
    const { ctx } = opts;
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    // User is no longer undefined
    return opts.next({ ctx: { user: ctx.user } })
})