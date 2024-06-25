import { useToastMessage } from "../context/toastContext";
import { label } from "../label";
import { trpc } from "../trpc";

export function useDeleteUserMutation() {
  const toastMessage = useToastMessage();
  const utils = trpc.useUtils();

  return trpc.deleteUser.useMutation({
    onSuccess(res) {
      utils.getUsers.invalidate();
      toastMessage({
        severity: "success",
        detail: label.userWasDeleted(res.username),
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
