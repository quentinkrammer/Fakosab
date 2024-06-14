import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { describe, expect, test } from "vitest";
import { env } from "../env.js";
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
  test("send a request", async () => {
    const res = await client.getFoo.query();
    expect(res).toEqual("Foo");
  });
});
