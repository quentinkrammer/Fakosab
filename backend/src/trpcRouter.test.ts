import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
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

describe("trpc", () => {
  beforeEach(async () => {
    await db.delete(users);
    await db.insert(users).values([fakeUser]);
  });

  test("getUsers", async () => {
    const res = await client.getUsers.query();
    expect(res).toEqual([{ ...fakeUser, resetPassword: null }]);
  });
});
