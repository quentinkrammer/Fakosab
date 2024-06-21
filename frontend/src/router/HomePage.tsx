import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { ProgressSpinner } from "primereact/progressspinner";
import { useCallback, useState } from "react";
import { useQueryMyUserData } from "../hooks/useQueryMyUserData";
import { trpc } from "../trpc";

export function HomePage() {
  const { isLoading, isError } = useQueryMyUserData();

  if (isLoading) return <ProgressSpinner />;
  if (isError) return <LoginForm />;
  return <BookingForm />;
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
    <>
      <InputText
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <Password
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        toggleMask
        panelStyle={{ display: "none" }}
      />
      <Button onClick={onSubmit}>Login</Button>
    </>
  );
}
function BookingForm() {
  // const { data } = useQueryMyUserData();
  return `Home`;
}
