import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { env } from "../env.js";
import { users } from "./db/schema.js";
import { resetPassword } from "./db/user.service.js";
import {
  adminProcedure,
  authedProcedure,
  publicProcedure,
  trpc,
} from "./trpc.js";

export const trpcRouter = trpc.router({
  getMyUserData: authedProcedure.query((opts) => {
    const user = opts.ctx.user;
    return user;
  }),
  getUsers: adminProcedure.query(async (opts) => {
    const db = opts.ctx.db;
    const users = await db.query.users.findMany({
      columns: { id: true, resetPassword: true, username: true },
    });
    return users;
  }),
  newUser: adminProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async (opts) => {
      const {
        input: { username },
        ctx: { db },
      } = opts;

      const newUsers = await db
        .insert(users)
        .values({ username })
        .returning({ userId: users.id });
      const newUser = newUsers[0]!;
      const withInitialPassword = await resetPassword(newUser.userId, db);
      return withInitialPassword[0]!;
    }),
  deleteUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async (opts) => {
      const {
        input: { userId },
        ctx: { db },
      } = opts;

      const deletedUsers = await db
        .delete(users)
        .where(eq(users.id, userId))
        .returning();
      const deletedUser = deletedUsers[0]!;
      return deletedUser;
    }),
  resetPassword: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async (opts) => {
      const {
        input: { userId },
        ctx: { db },
      } = opts;

      const updatedUser = await resetPassword(userId, db);
      return updatedUser;
    }),
  setPassword: publicProcedure
    .input(
      z.object({
        username: z.string(),
        resetPassword: z.string(),
        password: z.string().min(8).max(30),
      }),
    )
    .mutation(async (opts) => {
      const {
        input: { resetPassword, password, username },
        ctx: { db },
      } = opts;
      const user = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.username, username),
      });
      if (!user)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Username ${username} has not been registered`,
        });
      if (user.resetPassword !== resetPassword)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Incorrect password-reset-code`,
        });

      const salt = bcrypt.genSaltSync(env.salt);
      const encrypted = bcrypt.hashSync(password, salt);

      const updatedUser = await db
        .update(users)
        .set({ password: encrypted, resetPassword: null })
        .where(eq(users.username, username))
        .returning({ id: users.id, username: users.username });
      return updatedUser;
    }),
});

export type AppRouter = typeof trpcRouter;
