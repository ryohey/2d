import { Omit } from "lodash"

// https://stackoverflow.com/a/46700791
export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined
}

export type Optional<T, S extends keyof T> = Omit<T, S> & Partial<Pick<T, S>>
