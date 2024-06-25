import { useToastMessage } from "../context/toastContext";
import { label } from "../label";
import { trpc } from "../trpc";

export function useSetPasswordMutation() {
  const toastMessage = useToastMessage();

  return trpc.users.setPassword.useMutation({
    onSuccess() {
      toastMessage({
        severity: "success",
        detail: label.passwordResetSuccessfull,
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
