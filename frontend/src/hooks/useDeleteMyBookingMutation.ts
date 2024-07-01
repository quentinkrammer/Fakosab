import { useToastMessage } from "../context/toastContext";
import { label } from "../label";
import { trpc } from "../trpc";

export function useDeleteMyBookingMutation() {
  const toastMessage = useToastMessage();
  const utils = trpc.useUtils();

  return trpc.bookings.deleteMyBooking.useMutation({
    onSuccess(res) {
      utils.bookings.getMyBookings.invalidate();
      toastMessage({
        severity: "success",
        detail: label.bookingDeleted(`${res.id}`),
      });
    },
    onError(e) {
      console.error(e);
      toastMessage({
        severity: "error",
        detail: e.data?.code,
      });
    },
  });
}
