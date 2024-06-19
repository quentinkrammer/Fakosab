import bcrypt from "bcrypt";
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { db } from "./db/drizzle.js";
import { omit } from "./utils/omit.js";

passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password", session: true },
    async function verify(username, password, cb) {
      const user = await db.query.users.findFirst({
        columns: { password: true, isAdmin: true, id: true, username: true },
        where: (users, { eq }) => eq(users.username, username),
      });
      if (!user)
        return cb(null, false, {
          message: `The username ${username} does not exist.`,
        });
      if (!user.password)
        return cb(null, false, {
          message: `No password was provided.`,
        });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return cb(null, false, { message: "Incorrect password." });

      return cb(null, omit(user, "password"));
    },
  ),
);
passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (user, cb) {
  cb(null, user as Record<string, string>);
});

const router = express.Router();
router.use(
  express.urlencoded({
    extended: true,
  }),
);

router.post(
  "/login",
  passport.authenticate("local", {
    failureMessage: true,
    failureRedirect: "/auth/notAuthed",
    successRedirect: "/auth/authed",
  }),
);

router.get("/authed", function (_, res) {
  res.json("Login successfull");
});
router.get("/notAuthed", function (_, res) {
  res.json("Login failed");
});

export const authRouter = router;
