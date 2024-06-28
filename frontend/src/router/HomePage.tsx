import { isNil } from "lodash";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputTextProps } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { TabPanel, TabView } from "primereact/tabview";
import { Nullable } from "primereact/ts-helpers";
import { useCallback, useMemo, useState } from "react";
import { LabeledInput } from "../components/LabeledInput";
import { Password } from "../components/Password";
import { useToastMessage } from "../context/toastContext";
import { useNewBookingMutation } from "../hooks/useNewBookingMutation";
import { useQueryGetProjects } from "../hooks/useQueryGetProjects";
import { useQueryMyUserData } from "../hooks/useQueryMyUserData";
import { useSetPasswordMutation } from "../hooks/useSetPasswordMutation";
import { trpc } from "../trpc";
import { Project, ProjectValue } from "../types";
import { isNumberString } from "../utils/isNumberString";
import { label } from "./../label";

export function HomePage() {
  const { isLoading, isError } = useQueryMyUserData();

  if (isLoading) return <ProgressSpinner />;
  if (isError) return <LoginTabs />;
  return <BookingForm />;
}

function LoginTabs() {
  return (
    <>
      <TabView>
        <TabPanel header="Login">
          <LoginForm />
        </TabPanel>
        <TabPanel header="New Password">
          <NewPasswordForm />
        </TabPanel>
      </TabView>
    </>
  );
}

function LoginForm() {
  const utils = trpc.useUtils();
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const toast = useToastMessage();

  const onSubmit = useCallback(async () => {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${username}&password=${password}`,
      credentials: "include",
    });
    if (res.ok) {
      // All queries on all routers will be invalidated 🔥
      utils.invalidate();
      return;
    }
    toast({ severity: "error", detail: res.statusText });
  }, [password, toast, username, utils]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        paddingTop: "2rem",
      }}
    >
      <LabeledInput
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        label="Username"
      />
      <Password
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
      />
      <Button
        onClick={onSubmit}
        style={{ alignSelf: "flex-end" }}
        disabled={!password || !username}
      >
        Login
      </Button>
    </div>
  );
}

function NewPasswordForm() {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [username, setUsername] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [passwordValidation, setPasswordValidation] = useState("");
  const [repeatPasswordValidation, setRepeatPasswordValidation] = useState("");
  const [resetCodeValidation, setResetCodeValidation] = useState("");
  const [usernameValidation, setUsernameValidation] = useState("");
  const toastMessage = useToastMessage();
  const mutation = useSetPasswordMutation();

  const isDisabled = !password || !repeatPassword || !username || !resetCode;

  const onSubmit = () => {
    setUsernameValidation(username ? "" : label.fieldIsRequired);
    setResetCodeValidation(resetCode ? "" : label.fieldIsRequired);
    setPasswordValidation(password ? "" : label.fieldIsRequired);

    const passwordsMatch = password === repeatPassword;
    setRepeatPasswordValidation(passwordsMatch ? "" : label.passwordsDontMatch);
    if (!username || !resetCode || !password || !passwordsMatch) {
      toastMessage({ detail: label.someFieldsContainErrors, severity: "warn" });
      return;
    }

    mutation.mutate({ username, password, resetPassword: resetCode });
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
      <LabeledInput
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        label="Username"
        validationError={usernameValidation}
        showValidationError={!!usernameValidation}
      />
      <LabeledInput
        value={resetCode}
        onChange={(e) => setResetCode(e.target.value)}
        label="Reset Code"
        validationError={resetCodeValidation}
        showValidationError={!!resetCodeValidation}
      />
      <Password
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="New Password"
        validationError={passwordValidation}
        showValidationError={!!passwordValidation}
      />
      <Password
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
        label="Repeat Password"
        validationError={repeatPasswordValidation}
        showValidationError={!!repeatPasswordValidation}
      />
      <Button
        onClick={onSubmit}
        disabled={isDisabled}
        style={{ alignSelf: "flex-end" }}
      >
        Submit
      </Button>
    </div>
  );
}

const PROJECT_DROPDOWN_ID = "dd-project";
const DATE_CALENDAR_ID = "calendar-date";
function BookingForm() {
  const projects = useEnabledProjects();
  const [project, setProject] = useState<Nullable<Project>>(null);
  const [distance, setDistance] = useState("");
  const [date, setDate] = useState<Date>(() => {
    return new Date();
  });
  const bookingMutation = useNewBookingMutation();

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
