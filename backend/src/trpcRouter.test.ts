import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { eq } from "drizzle-orm";
import superjson from "superjson";
import { beforeEach, describe, expect, test } from "vitest";
import { env } from "../env.js";
import { db } from "./db/index.js";
import { users } from "./db/schema.js";
import { fakeUser } from "./trpc.js";
import { AppRouter } from "./trpcRouter.js";

const client = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `http://localhost:${env.port}/trpc`,
    }),
  ],
});

const newUser = "Jim";

describe("trpc", () => {
  beforeEach(async () => {
    await db.delete(users);
    await db.insert(users).values([fakeUser]);
  });

  test("getUsers", async () => {
    const res = await client.getUsers.query();
    expect(res).toEqual([{ ...fakeUser, resetPassword: null }]);
  });

  test("newUser", async () => {
    const res = await client.newUser.query({ username: newUser });
    expect(res.resetCode).toBeTypeOf("string");
    expect(res.resetCode).toHaveLength(8);
    expect(res.userId).toBeTypeOf("number");
  });

  test("resetPassword", async () => {
    // Arrange
    const { userId } = (
      await db
        .insert(users)
        .values({ username: newUser, password: "foo" })
        .returning({ userId: users.id })
    )[0]!;

    // Act
    const res = (await client.resetPassword.query({ userId }))[0]!;

    // Arrange
    const dbRes = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Assert
    expect(res.resetCode).toBeTypeOf("string");
    expect(res.resetCode).toHaveLength(8);
    expect(dbRes?.password).toBeNull();
  });

  test.only("setPassword", async () => {
    const resetPassword = "12345678";
    const newPw = "abcdefghijklmnopqrstuvwxyz";
    // Arrange
    const { userId } = (
      await db
        .insert(users)
        .values({ username: newUser, resetPassword })
        .returning({ userId: users.id })
    )[0]!;

    // Act
    const res = (
      await client.setPassword.query({
        username: newUser,
        password: newPw,
        resetPassword,
      })
    )[0]!;

    // Arrange
    const dbRes = await db.query.users.findFirst({
      where: eq(users.id, res.id),
    });

    // Assert//
    expect(res.username).toEqual(newUser);
    expect(dbRes?.resetPassword).toBeNull();
    expect(dbRes?.password).toHaveLength(60);
    expect(dbRes?.password).not.eq(newPw);
  });
});
