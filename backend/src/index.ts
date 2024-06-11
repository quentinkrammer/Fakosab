
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import memoryStore from 'memorystore';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

const MemoryStore = memoryStore(session)
const store = new MemoryStore({
    checkPeriod: 3600000 // prune expired entries every 1h
})

passport.use(new LocalStrategy(function verify(username, password, cb) {
    // check if credentials exist in DB
    if (username === 'Jim' && password === "123") {
        console.log('Local Strategy - SUCCESS')
        const user = { user: 'Jim', role: 'Admin', id: '42' }
        return cb(null, user)
    }
    console.log('Local Strategy - FAILED')
    return cb(null, false, { message: 'Incorrect username or password.' })
}));

passport.serializeUser(function (user, cb) {
    console.log('Serializer: ', user)
    cb(null, user);
});

passport.deserializeUser(function (user, cb) {
    // check if user is in memorystore, then deserialize it
    console.log('DeserializeUser: ', user)
    cb(null, user as Record<string, string>);
});


const authRouter = express.Router();
authRouter.get('/authed', function (req, res, next) {
    console.log('authRouter - User: ', JSON.stringify(req.user))
    res.json('Login successfull');
});
authRouter.get('/notAuthed', function (req, res, next) {
    res.json('Login failed');
});

authRouter.post(
    '/login',
    passport.authenticate('local', { failureMessage: true, failureRedirect: '/notAuthed' }),
    function (req, res) {
        console.log('Successfull authentication - User: ', JSON.stringify(req.user))
        res.redirect('/authed');
    });
const app = express();

app.use(cors({ origin: '*' }))
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    cookie: { maxAge: 3600000 },
    store,
    // not sure if this is needed
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

app.use('/', authRouter)
app.listen(3000);