import { Toast, ToastMessage } from "primereact/toast";
import { MutableRefObject, createContext, useContext } from "react";

type ToastArgs = Partial<ToastMessage> & Required<Pick<ToastMessage, "detail">>;

export const toastContext = createContext<MutableRefObject<Toast> | undefined>(
  undefined,
);

export function useToastMessage() {
  const toastRef = useContext(toastContext);
  if (!toastRef)
    throw new Error("hook was called outside of the related context provider");
  return ({ detail, ...other }: ToastArgs) =>
    toastRef.current.show({
      detail,
      severity: "info",
      life: 5000,
      closable: true,
      ...other,
    });
}
