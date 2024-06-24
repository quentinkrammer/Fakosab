import { useToastMessage } from "../context/toastContext";
import { label } from "../label";
import { trpc } from "../trpc";

export function useResetPasswordMutation() {
  const toastMessage = useToastMessage();
  const utils = trpc.useUtils();

  return trpc.resetPassword.useMutation({
    onSuccess() {
      utils.getUsers.invalidate();
      toastMessage({
        severity: "success",
        detail: label.resetCodeGenerated,
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
