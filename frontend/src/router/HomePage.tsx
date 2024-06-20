import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { ProgressSpinner } from "primereact/progressspinner";
import { useState } from "react";
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

  async function onSubmit() {
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
  }

  return (
    <>
      <InputText
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Password
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        toggleMask
      />
      <Button onClick={onSubmit}>Login</Button>
    </>
  );
}
function BookingForm() {
  const { data } = useQueryMyUserData();
  return `Booking: ${JSON.stringify(data)}`;
}
