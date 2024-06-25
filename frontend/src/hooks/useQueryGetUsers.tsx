import { env } from "../env";
import { trpc } from "../trpc";

export function useQueryGetUsers() {
  return trpc.users.getUsers.useQuery(undefined, {
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: env.mode !== "development",
  });
}
