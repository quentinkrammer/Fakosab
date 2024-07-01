import { isNil } from "lodash";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputTextProps } from "primereact/inputtext";
import { Nullable } from "primereact/ts-helpers";
import { useCallback, useMemo, useState } from "react";
import { LabeledInput } from "../components/LabeledInput";
import { useNewBookingMutation } from "../hooks/useNewBookingMutation";
import { useQueryGetProjects } from "../hooks/useQueryGetProjects";
import { Project, ProjectValue } from "../types";
import { isNumberString } from "../utils/isNumberString";

const PROJECT_DROPDOWN_ID = "dd-project";
const DATE_CALENDAR_ID = "calendar-date";

type BookingFormProps = { onSuccess?: () => void };
export function BookingForm({ onSuccess }: BookingFormProps) {
  const projects = useEnabledProjects();
  const [project, setProject] = useState<Nullable<Project>>(null);
  const [distance, setDistance] = useState("");
  const [date, setDate] = useState<Date>(() => {
    return new Date();
  });
  const bookingMutation = useNewBookingMutation(onSuccess);

  const onDistance = useCallback<NonNullable<InputTextProps["onChange"]>>(
    (e) => {
      const newValue = e.target.value;
      if (!isNumberString(newValue)) return;
      setDistance(newValue.replace(",", "."));
    },
    [],
  );

  const onSubmit = () => {
    const distanceMeters = convertDistanceStringToMeters(distance);
    if (!distanceMeters || !project || !date) return;

    bookingMutation.mutate({
      distance: distanceMeters,
      projectId: project.id,
      timestamp: `${date}`,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        paddingTop: "2rem",
      }}
    >
      <FloatLabel>
        <Dropdown
          value={project}
          onChange={(e) => setProject(e.value)}
          options={projects}
          optionLabel={"name" satisfies ProjectValue}
          style={{ minWidth: "10rem", width: "100%" }}
          inputId={PROJECT_DROPDOWN_ID}
        />
        <label htmlFor={PROJECT_DROPDOWN_ID}>Project</label>
      </FloatLabel>
      <LabeledInput
        value={distance}
        label="Distance"
        onChange={onDistance}
        rightContent={"km"}
      />
      <FloatLabel>
        <Calendar
          value={date}
          onChange={(e) => {
            const newDate = e.value;
            if (isNil(newDate)) return;
            setDate(newDate);
          }}
          style={{ width: "100%" }}
          inputId={DATE_CALENDAR_ID}
        />
        <label htmlFor={DATE_CALENDAR_ID}>Date</label>
      </FloatLabel>
      <Button
        style={{ alignSelf: "end" }}
        onClick={onSubmit}
        disabled={!distance || !project}
      >
        Submit
      </Button>
    </div>
  );
}
function useEnabledProjects() {
  const res = useQueryGetProjects();
  const projects = useMemo(() => res.data ?? [], [res.data]);

  return projects.filter((project) => Boolean(!project.disabled));
}
function convertDistanceStringToMeters(value: string) {
  if (!isNumberString(value)) return;
  const valueFloat = parseFloat(value) * 1000;
  const valueInt = Math.round(valueFloat);

  return valueInt;
}
