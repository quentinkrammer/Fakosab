import { TRPCError, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import superjson from "superjson";
import z, { ZodError } from "zod";
import { db } from "./db/index.js";
import { InsertUsers } from "./db/schema.js";

const userSchema = z.object({
  username: z.string(),
  isAdmin: z.boolean().or(z.null()),
  id: z.number(),
});
export const fakeUser: z.infer<typeof userSchema> = {
  id: 42,
  username: "DevEnvUser",
  isAdmin: true,
} satisfies InsertUsers;

export const createContext = ({
  req,
}: trpcExpress.CreateExpressContextOptions) => {
  const user = process.env["NODE_ENV"] === "development" ? fakeUser : req.user;

  const { data } = userSchema.safeParse(user);
  return {
    user: data,
    db,
  };
};
type Context = Awaited<ReturnType<typeof createContext>>;

export const trpc = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const publicProcedure = trpc.procedure;
export const authedProcedure = trpc.procedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    // User is no longer undefined
    return opts.next({ ctx: { user: ctx.user } });
  },
);
export const adminProcedure = authedProcedure.use(async function isAdmin(opts) {
  const { ctx } = opts;
  if (!ctx.user.isAdmin)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Request requires admin privliges",
    });
  // User is no longer undefined
  const admin = { ...ctx.user, isAdmin: true } as const;
  return opts.next({ ctx: { user: admin } });
});
