import { useToastMessage } from "../context/toastContext";
import { label } from "../label";
import { trpc } from "../trpc";

export function useNewUserMutation(onSuccess: () => void) {
  const toastMessage = useToastMessage();
  const utils = trpc.useUtils();

  return trpc.users.newUser.useMutation({
    onSuccess() {
      utils.users.getUsers.invalidate(),
        toastMessage({
          severity: "success",
          detail: label.newUsernameRegistered,
        });
      onSuccess();
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
