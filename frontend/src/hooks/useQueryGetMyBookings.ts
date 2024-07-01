import { env } from "../env";
import { trpc } from "../trpc";

export function useQueryGetMyBookings() {
  return trpc.bookings.getMyBookings.useQuery(undefined, {
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: env.mode !== "development",
  });
}
