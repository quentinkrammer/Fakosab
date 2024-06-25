import { useToastMessage } from "../context/toastContext";
import { label } from "../label";
import { trpc } from "../trpc";

export function useSetProjectDisabledMutation() {
  const toastMessage = useToastMessage();
  const utils = trpc.useUtils();

  return trpc.projects.setIsDisabled.useMutation({
    onSuccess() {
      utils.projects.getProjects.invalidate();
      toastMessage({
        severity: "success",
        detail: label.projectAvailabilityChanged,
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
