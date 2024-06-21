import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { ProgressSpinner } from "primereact/progressspinner";
import { TabPanel, TabView } from "primereact/tabview";
import { useCallback, useState } from "react";
import { useQueryMyUserData } from "../hooks/useQueryMyUserData";
import { useSetPasswordMutation } from "../hooks/useSetPasswordMutation";
import { trpc } from "../trpc";
import { LabeledInput } from "./LabeledInput";

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
    }
  }, [password, username, utils]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <LabeledInput
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        label="Username"
      />
      <LabeledInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
      />

      <Button onClick={onSubmit} style={{ alignSelf: "flex-end" }}>
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

  const mutation = useSetPasswordMutation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <InputText
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <InputText
        value={resetCode}
        onChange={(e) => setResetCode(e.target.value)}
        placeholder="Reset Code"
      />
      <Password
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New Password"
        toggleMask
        panelStyle={{ display: "none" }}
      />
      <Password
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
        placeholder="Repeat Password"
        toggleMask
        panelStyle={{ display: "none" }}
      />
      <Button
        onClick={() =>
          mutation.mutate({ username, password, resetPassword: resetCode })
        }
        style={{ alignSelf: "flex-end" }}
      >
        Login
      </Button>
    </div>
  );
}

function BookingForm() {
  // const { data } = useQueryMyUserData();
  return `Home`;
}
