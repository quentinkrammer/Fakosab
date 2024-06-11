
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';
import z from 'zod';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors from 'cors'


passport.use(new LocalStrategy(function verify(username, password, cb) {
    console.log('hier')
    if (username === 'Bastian' && password === "123") return cb(null, { user: 'Bastian', role: 'Admin', id: '1337' })
    return cb(null, false, { message: 'Incorrect username or password.' })
}));

passport.serializeUser(function (user, cb) {
    console.log('hier1')
    process.nextTick(function () {
        cb(null, user);
    });
});

passport.deserializeUser(function (user, cb) {
    console.log('hier2')
    process.nextTick(function () {
        return cb(null, user as Record<string, string>);
    });
});

// created for each request
const createContext = ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) => {
    console.log('hier3')
    return ({
        session: 'some_session'
    })
}
type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();
const appRouter = t.router({
    getUser: t.procedure.input(z.string()).query((opts) => {
        opts.input;
        return { id: opts.input, name: 'Bilbo' };
    }),

    // createUser: t.procedure
    //     .input(z.object({ name: z.string().min(5) }))
    //     .mutation(async (opts) => {
    //         // use your ORM of choice
    //         return await UserModel.create({
    //             data: opts.input,
    //         });
    //     }),
});

var authRouter = express.Router();
authRouter.get('/', function (req, res, next) {
    res.json('Login successfull');
});
authRouter.get('/login', function (req, res, next) {
    res.json('Login failed');
});
authRouter.post('/foo/bar', function (req, res, next) {
    res.json('foo bar');
});
authRouter.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));
const app = express();

app.use(cors({ origin: '*' }))
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));
app.use('/', authRouter)
app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    }),
);
app.listen(3000);