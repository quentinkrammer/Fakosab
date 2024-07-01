import { UniqueBookingConstraintError } from "../components/UniqueBookingConstraintError";
import { useToastMessage } from "../context/toastContext";
import { trpc } from "../trpc";

export function useNewBookingMutation(onSuccess?: () => void) {
  const toastMessage = useToastMessage();
  const utils = trpc.useUtils();

  return trpc.bookings.createBooking.useMutation({
    onSuccess() {
      utils.bookings.getMyBookings.invalidate();
      utils.bookings.getAllBookings.invalidate();
      toastMessage({
        severity: "success",
        detail: "New booking registered",
      });
      onSuccess?.();
    },
    onError(e) {
      console.error(e);
      toastMessage({
        severity: "error",
        detail: <UniqueBookingConstraintError error={e} />,
        life: 5000,
      });
    },
  });
}
