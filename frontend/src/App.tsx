import { Button } from "primereact/button";
import { FormEvent, useState } from "react";

function App() {
  const [res, setRes] = useState("");
  // const createUserMutation = trpc.createUser.useMutation();
  // const fooQuery = trpc.getFoo.useQuery();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${e.currentTarget.username.value}&password=${e.currentTarget.password.value}`,
      credentials: "include",
    });
    const resBody = await res.json();
    setRes(resBody);
  }
  return (
    <>
      <Button>click</Button>
    </>
  );
}

export default App;
