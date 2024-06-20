import { trpc } from "../trpc";

export function useQueryMyUserData() {
  return trpc.getMyUserData.useQuery(undefined, {
    retry: false,
    staleTime: Infinity,
  });
}
