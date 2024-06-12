
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

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

const router = express.Router();
router.post(
    "/login",
    passport.authenticate("local", {
        failureMessage: true,
        failureRedirect: "/notAuthed",
        successRedirect: "/authed"
    }),
);

router.get("/authed", function (req, res, next) {
    res.json("Login successfull");
});
router.get("/notAuthed", function (req, res, next) {
    res.json("Login failed");
});

export const authRouter = router