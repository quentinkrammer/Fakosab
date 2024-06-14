import _omit from 'lodash/omit.js';
import { UnknownObject } from "../types.js";

export function omit<T extends UnknownObject, U extends Array<keyof T>>(
  object: T,
  ...key: U
): Omit<T, U[number]> {
  return _omit(object, ...key);
}
