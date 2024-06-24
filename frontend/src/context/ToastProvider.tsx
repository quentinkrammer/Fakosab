import { Toast } from "primereact/toast";
import { ReactNode, useRef } from "react";
import { toastContext } from "./toastContext";

type ToastProviderProps = { children: ReactNode };
export function ToastProvider({ children }: ToastProviderProps) {
  const toastRef = useRef<Toast>(null!);

  return (
    <toastContext.Provider value={toastRef}>
      <Toast ref={toastRef} />
      <>{children}</>
    </toastContext.Provider>
  );
}
