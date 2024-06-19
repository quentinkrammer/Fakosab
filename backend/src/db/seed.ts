import bcrypt from "bcrypt";
import { env } from "../../env.js";
import { db } from "./drizzle.js";
import * as schema from "./schema.js";

async function insertUser({
  isAdmin,
  password,
  username,
}: Pick<schema.InsertUsers, "isAdmin" | "username"> & { password: string }) {
  const salt = bcrypt.genSaltSync(env.salt);
  const encrypted = bcrypt.hashSync(password, salt);

  const newAdmin = (
    await db
      .insert(schema.users)
      .values({ username, isAdmin: Boolean(isAdmin), password: encrypted })
      .returning()
  )[0];

  console.log("New Admin Created: ", newAdmin);
}

async function clearDb() {
  await db.delete(schema.users);
}

async function seedWithAdmin() {
  await clearDb();
  await insertUser({ password: "123", username: "Jim", isAdmin: true });
}

seedWithAdmin();
