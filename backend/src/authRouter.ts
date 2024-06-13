
import bcrypt from 'bcrypt';
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { db } from "./db/index.js";
import { omit } from './utils/omit.js';


passport.use(
    new LocalStrategy(async function verify(username, password, cb) {
        const user = await db.query.users.findFirst({
            columns: {password: true, isAdmin : true, id : true},
            where: (users, { eq }) => eq(users.username, username)
          })
        if(!user) return cb(null, false, { message: `The username ${username} does not exist.` });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return cb(null, false, { message: "Incorrect password." });
        
        return cb(null, omit(user, 'password'));
    }),
);
passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (user, cb) {
    cb(null, user as Record<string, string>);
});

const router = express.Router();
router.post(
    "/login",
    passport.authenticate("local", {
        failureMessage: true,
        failureRedirect: "/notAuthed",
        successRedirect: "/authed"
    }),
);

router.get("/authed", function (_, res) {
    res.json("Login successfull");
});
router.get("/notAuthed", function (_, res) {
    res.json("Login failed");
});

export const authRouter = router