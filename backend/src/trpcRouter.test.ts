import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { eq } from "drizzle-orm";
import superjson from "superjson";
import { beforeEach, describe, expect, test } from "vitest";
import { env } from "../env.js";
import { db } from "./db/drizzle.js";
import { users } from "./db/schema.js";
import { seedWithAdmin } from "./db/seedHelper.js";
import { AppRouter } from "./trpcRouter.js";
import { omit } from "./utils/omit.js";

const client = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `http://localhost:${env.port}/trpc`,
    }),
  ],
});

const newUserName = "JimBo";

describe("trpc", () => {
  let mockAdmin: Awaited<ReturnType<typeof seedWithAdmin>>;

  beforeEach(async () => {
    mockAdmin = await seedWithAdmin();
  });

  test("getUsers", async () => {
    const res = await client.getUsers.query();
    expect(res).toEqual([
      { ...omit(mockAdmin, "password"), resetPassword: null },
    ]);
  });

  test("newUser", async () => {
    const res = await client.newUser.query({ username: newUserName });
    expect(res.resetCode).toBeTypeOf("string");
    expect(res.resetCode).toHaveLength(8);
    expect(res.userId).toBeTypeOf("number");
  });

  test("resetPassword", async () => {
    // Arrange
    const { userId } = (
      await db
        .insert(users)
        .values({ username: newUserName, password: "foo" })
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

  test("setPassword", async () => {
    const resetPassword = "12345678";
    const newPw = "abcdefghijklmnopqrstuvwxyz";
    // Arrange
    const { userId: newUserId } = (
      await db
        .insert(users)
        .values({ username: newUserName, resetPassword })
        .returning({ userId: users.id })
    )[0]!;

    // Act
    const res = (
      await client.setPassword.query({
        username: newUserName,
        password: newPw,
        resetPassword,
      })
    )[0]!;

    // Arrange
    const dbRes = await db.query.users.findFirst({
      where: eq(users.id, res.id),
    });

    // Assert//
    expect(res.username).toEqual(newUserName);
    expect(res.id).toEqual(newUserId);
    expect(dbRes?.resetPassword).toBeNull();
    expect(dbRes?.password).toHaveLength(60);
    expect(dbRes?.password).not.eq(newPw);
  });
});
