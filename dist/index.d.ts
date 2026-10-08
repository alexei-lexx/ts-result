declare class SuccessResult<TData> {
    readonly data: TData;
    readonly success: true;
    constructor(data: TData);
    map<TNewData>(callback: (data: TData) => TNewData): Result<TNewData, never>;
    unwrapOrThrowAs<TThrowable extends Error>(_throwableClass: new (error: never) => TThrowable): TData;
}
declare class FailureResult<TError = string> {
    readonly error: TError;
    readonly success: false;
    constructor(error: TError);
    map<TNewData>(_callback: (data: never) => TNewData): Result<TNewData, TError>;
    unwrapOrThrowAs<TThrowable extends Error>(throwableClass: new (error: TError) => TThrowable): never;
}
export type Result<TData, TError = string> = SuccessResult<TData> | FailureResult<TError>;
export declare function Success<TData>(data: TData): Result<TData, never>;
export declare function Failure<TError = string>(error: TError): Result<never, TError>;
export declare const Result: {
    fromThrowable<TData, TThrowable extends Error>(throwableClass: new (...args: never[]) => TThrowable, throwableFunc: () => TData): Result<TData, string>;
};
export {};
