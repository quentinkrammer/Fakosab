import { env } from "../env";
import { trpc } from "../trpc";

export function useQueryGetProjects() {
  return trpc.projects.getProjects.useQuery(undefined, {
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: env.mode !== "development",
  });
}
