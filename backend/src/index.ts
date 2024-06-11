
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';
import z from 'zod';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session'
import cors from 'cors'
import memoryStore from 'memorystore'

const MemoryStore = memoryStore(session)

passport.use(new LocalStrategy(function verify(username, password, cb) {
    if (username === 'Bastian' && password === "123") {
        console.log('Local Strategy - User added to Request')
        return cb(null, { user: 'Bastian', role: 'Admin', id: '1337' })
    }
    console.log('Local Strategy - Failed to autheticate user.')
    return cb(null, false, { message: 'Incorrect username or password.' })
}));

passport.serializeUser(function (user, cb) {
    console.log('Serializer: ', user)
    cb(null, user);
});

passport.deserializeUser(function (user, cb) {
    // find user in memorystore
    console.log('DeserializeUser: ', user)
    cb(null, user as Record<string, string>);
});

// created for each request
const createContext = ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) => {
    console.log('TRPC context', JSON.stringify(req.user))
    return ({
        user: 'some_session'
    })
}
type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();
const appRouter = t.router({
    getFoo: t.procedure.query((opts) => {
        return "Foo";
    }),
});

var authRouter = express.Router();
authRouter.get('/', function (req, res, next) {
    console.log('authRouter: ', JSON.stringify(req.user))
    res.json('Login successfull');
});
authRouter.get('/login', function (req, res, next) {
    res.json('Login failed');
});
authRouter.post('/foo/bar', function (req, res, next) {
    res.json('foo bar');
});
authRouter.post(
    '/login/password',
    passport.authenticate('local', { failureMessage: true, failureRedirect: '/login' }),
    function (req, res) {
        console.log('Successfull authentication', JSON.stringify(req.user))
        res.redirect('/');
    });
const app = express();

app.use(cors({ origin: '*' }))
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    cookie: { maxAge: 3600000 },
    store: new MemoryStore({
        checkPeriod: 3600000 // prune expired entries every 1h
    }),
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