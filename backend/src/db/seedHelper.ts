import bcrypt from "bcrypt";
import { env } from "../../env.js";
import { db } from "./drizzle.js";
import * as schema from "./schema.js";

type SeedUser = Pick<schema.InsertUsers, "isAdmin" | "username"> & {
  password: string;
};

async function insertUser({ isAdmin, password, username }: SeedUser) {
  const salt = bcrypt.genSaltSync(env.salt);
  const encrypted = bcrypt.hashSync(password, salt);

  const newAdmin = (
    await db
      .insert(schema.users)
      .values({ username, isAdmin: Boolean(isAdmin), password: encrypted })
      .returning()
  )[0];

  console.log("New Admin Created: ", newAdmin);
  return newAdmin;
}

async function clearDb() {
  await db.delete(schema.users);
}

export const mockAdmin = {
  password: "123",
  username: "Jim",
  isAdmin: true,
} as const;
export async function seedWithAdmin({
  username,
  password,
  isAdmin,
}: SeedUser = mockAdmin) {
  await clearDb();
  const mockAdmin = await insertUser({
    password,
    username,
    isAdmin: Boolean(isAdmin),
  });
  if (!mockAdmin) throw new Error("Seeding DB with MockAdminUser failed!");
  return mockAdmin;
}
