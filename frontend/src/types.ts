import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "backend/index";

export type UnknownObject = Record<string, unknown>;
export type Omit<T, U extends keyof T> = Pick<T, Exclude<keyof T, U>>;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
