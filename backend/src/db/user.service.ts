import { eq } from "drizzle-orm";
import { randomString } from "../utils/randomString.js";
import { Db } from "./index.js";
import { SelectUsers, users } from "./schema.js";

export async function resetPassword(userId: SelectUsers["id"], db: Db) {
  const resetPassword = randomString(8);
  const updatedUser = await db
    .update(users)
    .set({ password: null, resetPassword })
    .where(eq(users.id, userId))
    .returning({
      userId: users.id,
      resetCode: users.resetPassword,
    });

  return updatedUser;
}
