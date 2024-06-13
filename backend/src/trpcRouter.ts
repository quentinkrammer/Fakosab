
import { TRPCError } from "@trpc/server";
import bcrypt from 'bcrypt';
import { eq } from "drizzle-orm";
import { z } from "zod";
import { initialUsers, users } from "./db/schema.js";
import { adminProcedure, authedProcedure, publicProcedure, trpc } from "./trpc.js";
import { randomString } from "./utils/randomString.js";

export const trpcRouter = trpc.router({
    getFoo: authedProcedure.query(() => {
        return "Foo";
    }),
    createInitialUser: adminProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async (opts) => {
        const {input: { username}, ctx : { db }} = opts
        const res = await db.insert(initialUsers).values({username,initialPassword: randomString(8) })
        return res       
    }),
    createUser: publicProcedure.input(z.object({username: z.string(),
        initialPassword: z.string(),
        password: z.string().min(8).max(30)}))
        .mutation(async (opts) => {
            const { input: {initialPassword, password, username}, ctx : { db }} = opts
            const iniUser = await db.query.initialUsers.findFirst({where: (initialUser, { eq }) => eq(initialUser.username, username)})
            if(!iniUser) throw new TRPCError({ code: 'BAD_REQUEST', message: `Username ${username} has not been registered`});            
            if(iniUser.initialPassword !== initialPassword) throw new TRPCError({ code: 'BAD_REQUEST', message: `Incorrect initial password`});
            
            const salt = z.string().parse(process.env['DATABASE_URL']);
            const encrypted = bcrypt.hashSync(password, salt);
            const newUser = await db.insert(users).values({username, password: encrypted})
            await db.delete(initialUsers).where(eq(initialUsers.username, username))
            return newUser 
        })
});

