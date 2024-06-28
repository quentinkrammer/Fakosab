import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "backend/index";
import { type ButtonProps } from "primereact/button";

export type UnknownObject = Record<string, unknown>;
export type Omit<T, U extends keyof T> = Pick<T, Exclude<keyof T, U>>;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

export type ButtonEvent = Parameters<NonNullable<ButtonProps["onClick"]>>[0];

type DataValue<U extends Array<UnknownObject> | undefined> =
  keyof NonNullable<U>[number];

export type Projects = RouterOutput["projects"]["getProjects"];
export type Project = Projects[number];
export type ProjectValue = DataValue<Projects>;
