import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { FormEvent, useState } from "react";
import superjson from "superjson";
import "./App.css";
import { trpc } from "./trpc";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      // You can pass any HTTP headers you wish here
      async headers() {
        return {};
      },
    }),
  ],
});

function App() {
  const [res, setRes] = useState("");
  const createUserMutation = trpc.createUser.useMutation();

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
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <label>
          <span>Username</span>
          <input type="text" name="username" required value="Jim" />
        </label>
        <label>
          <span>Password</span>
          <input type="password" name="password" required value={"123"} />
        </label>
        <button type="submit">Login</button>
      </form>
      <h1>Response: {res}</h1>
      <button onClick={() => createUserMutation.mutate({ name: "Bill" })}>
        fetch
      </button>
    </>
  );
}

export default App;
