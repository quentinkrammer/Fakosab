import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React from "react";
import ReactDOM from "react-dom/client";
import superjson from "superjson";
import "./App.css";
import App from "./App.tsx";
import "./index.css";
import { trpc } from "./trpc";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      // You can pass any HTTP headers you wish here
      headers: {
        Bar: "42",
        Foo: "foo",
        Cookie:
          "connect.sid=s%3AakZJitFqokXf21yg71N0GF4chyc28SRE.u0oTIQT8Gqc%2BTKLjGpd3xai6SvGhKvbTx4c%2FLxFG954",
      },
    }),
  ],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
);
