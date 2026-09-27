import type { Result } from "./index.js";
declare module "vitest" {
    interface Matchers<R, T> {
        toBeSuccess: T extends Result<infer TData, unknown> ? (data?: [TData] extends [never] ? unknown : TData) => R : never;
        toBeFailure: T extends Result<unknown, infer TError> ? (error: [TError] extends [never] ? unknown : TError) => R : never;
    }
}
