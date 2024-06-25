import { useToastMessage } from "../context/toastContext";
import { label } from "../label";
import { trpc } from "../trpc";

export function useNewProjectMutation(onSuccess: () => void) {
  const toastMessage = useToastMessage();
  const utils = trpc.useUtils();

  return trpc.projects.createProject.useMutation({
    onSuccess() {
      utils.projects.getProjects.invalidate(),
        toastMessage({
          severity: "success",
          detail: label.newProjectCreated,
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
