export type UnknownObject = Record<string, unknown>;
export type Omit<T, U extends keyof T> = Pick<T, Exclude<keyof T, U>>;