import { useToastMessage } from "../context/toastContext";
import { label } from "../label";
import { trpc } from "../trpc";

export function useDeleteProjectMutation() {
  const toastMessage = useToastMessage();
  const utils = trpc.useUtils();

  return trpc.projects.deleteProject.useMutation({
    onSuccess(res) {
      utils.projects.getProjects.invalidate();
      toastMessage({
        severity: "success",
        detail: label.projectDeleted(res.name),
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
