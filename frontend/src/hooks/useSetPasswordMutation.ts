import { trpc } from "../trpc";

export function useSetPasswordMutation() {
  return trpc.setPassword.useMutation({
    onSuccess() {
      alert("Success");
    },
    onError() {
      alert("Error");
    },
  });
}
