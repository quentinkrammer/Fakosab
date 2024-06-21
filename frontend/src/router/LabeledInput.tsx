import { FloatLabel } from "primereact/floatlabel";
import { InputText, InputTextProps } from "primereact/inputtext";
import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { Omit } from "../types";

// IMPROVE: get this value from primereact config
const RIGHT_PADDING = "0.75rem";
type LabeledInputText = Omit<InputTextProps, "id" | "placeholder"> & {
  label: string;
  rightContent?: ReactNode;
};

export function LabeledInput({
  label,
  rightContent,
  ...forwardInputProps
}: LabeledInputText) {
  const rightContentRef = useRef<HTMLSpanElement>(null!);
  const [rightContentWidth, setRightContentWidth] = useState(0);

  useEffect(() => {
    const width = rightContentRef.current.getBoundingClientRect().width;
    setRightContentWidth(width);
  }, [rightContent]);

  const id = useId();

  return (
    <div style={{ paddingTop: "0.5rem" }}>
      <FloatLabel>
        <InputText
          {...forwardInputProps}
          id={id}
          style={{
            paddingRight: `calc(${rightContentWidth}px + 2 * ${RIGHT_PADDING})`,
          }}
        />
        <label htmlFor={id}>{label}</label>
        <span
          ref={rightContentRef}
          style={{
            height: "100%",
            position: "absolute",
            display: "inline-grid",
            placeItems: "center",
            right: RIGHT_PADDING,
            color: "var(--text-color-secondary)",
          }}
        >
          {rightContent}
        </span>
      </FloatLabel>
    </div>
  );
}
