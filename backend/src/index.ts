import { TRPCError, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import cors from "cors";
import express from "express";
import session from "express-session";
import memoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import z from "zod"

const MemoryStore = memoryStore(session);
const store = new MemoryStore({
    checkPeriod: 3600000,
});

passport.use(
    new LocalStrategy(function verify(username, password, cb) {
        if (username === "Jim" && password === "123") {
            const user = { user: "Jim", role: "Admin", id: "42" };
            return cb(null, user);
        }
        return cb(null, false, { message: "Incorrect username or password." });
    }),
);
passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (user, cb) {
    cb(null, user as Record<string, string>);
});

const authRouter = express.Router();
authRouter.post(
    "/login",
    passport.authenticate("local", {
        failureMessage: true,
        failureRedirect: "/notAuthed",
        successRedirect: "/authed"
    }),
);
authRouter.get("/authed", function (req, res, next) {
    res.json("Login successfull");
});
authRouter.get("/notAuthed", function (req, res, next) {
    res.json("Login failed");
});


const userSchema = z.object({
    username: z.string(),
    role: z.optional(z.literal('admin')),
    userId: z.number()
})
const createContext = ({
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
const t = initTRPC.context<Context>().create();

const authedProcedure = t.procedure.use(async function isAuthed(opts) {
    const { ctx } = opts;
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    // User is no longer undefined
    return opts.next({ ctx: { user: ctx.user } })
})

const appRouter = t.router({
    getFoo: authedProcedure.query(() => {
        return "Foo";
    }),
});

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        cookie: { maxAge: 3600000 },
        store,
        // not sure if this is needed
        saveUninitialized: false,
    }),
);
app.use(passport.authenticate("session"));
app.use("/", authRouter);
app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    }),
);
app.listen(3000);
