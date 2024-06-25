import { STRING_NOT_FOUND } from "../constants";
import { useToastMessage } from "../context/toastContext";
import { trpc } from "../trpc";

export function useRenameProjectMutation({
  name,
  onSuccess,
}: {
  name: string;
  onSuccess: () => void;
}) {
  const toastMessage = useToastMessage();
  const utils = trpc.useUtils();

  return trpc.projects.renameProject.useMutation({
    onSuccess(res) {
      utils.projects.getProjects.invalidate(),
        toastMessage({
          severity: "success",
          detail: `Project "${name}" has been renamed to "${res.at(0)?.name ?? STRING_NOT_FOUND}"`,
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
