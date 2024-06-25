import { trpc } from "../trpc";

export function useQueryMyUserData() {
  return trpc.users.getMyUserData.useQuery(undefined, {
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
