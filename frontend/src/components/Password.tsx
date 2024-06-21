import { useCallback, useMemo, useState } from "react";
import { Omit } from "../types";
import { LabeledInput, LabeledInputProps } from "./LabeledInput";

type PasswordProps = Omit<LabeledInputProps, "rightContent" | "type">;

export function Password(props: PasswordProps) {
  const [isReadable, setIsReadable] = useState(false);

  const type = useMemo(() => {
    return isReadable ? "text" : "password";
  }, [isReadable]);

  const icon = useMemo(() => {
    return isReadable ? "pi pi-eye" : "pi pi-eye-slash";
  }, [isReadable]);

  const onIcon = useCallback(() => setIsReadable((old) => !old), []);

  return (
    <LabeledInput
      {...props}
      rightContent={<i className={icon} onClick={onIcon}></i>}
      type={type}
    />
  );
}
