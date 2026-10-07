declare class SuccessResult<TData> {
    readonly data: TData;
    readonly success: true;
    constructor(data: TData);
    map<TNewData>(callback: (data: TData) => TNewData): Result<TNewData, never>;
    mapAsync<TNewData>(callback: (data: TData) => Promise<TNewData>): ResultAsync<TNewData, never>;
    andThen<TNewData, TNewError>(callback: (data: TData) => Result<TNewData, TNewError>): Result<TNewData, TNewError>;
    andThenAsync<TNewData, TNewError>(callback: (data: TData) => PromiseLike<Result<TNewData, TNewError>>): ResultAsync<TNewData, TNewError>;
    unwrapOrThrowAs<TThrowable extends Error>(_throwableClass: new (error: never) => TThrowable): TData;
}
declare class FailureResult<TError = string> {
    readonly error: TError;
    readonly success: false;
    constructor(error: TError);
    map<TNewData>(_callback: (data: never) => TNewData): Result<TNewData, TError>;
    mapAsync<TNewData>(_callback: (data: never) => Promise<TNewData>): ResultAsync<TNewData, TError>;
    andThen<TNewData, TNewError>(_callback: (data: never) => Result<TNewData, TNewError>): Result<TNewData, TError | TNewError>;
    andThenAsync<TNewData, TNewError>(_callback: (data: never) => PromiseLike<Result<TNewData, TNewError>>): ResultAsync<TNewData, TError | TNewError>;
    unwrapOrThrowAs<TThrowable extends Error>(throwableClass: new (error: TError) => TThrowable): never;
}
export type Result<TData, TError = string> = SuccessResult<TData> | FailureResult<TError>;
export declare function Success<TData>(data: TData): Result<TData, never>;
export declare function Failure<TError = string>(error: TError): Result<never, TError>;
export declare const Result: {
    fromThrowable<TData, TThrowable extends Error>(throwableClass: new (...args: never[]) => TThrowable, throwableFunc: () => TData): Result<TData, string>;
};
export declare class ResultAsync<TData, TError = string> implements PromiseLike<Result<TData, TError>> {
    private readonly promise;
    constructor(promise: Promise<Result<TData, TError>>);
    then<TResult1 = Result<TData, TError>, TResult2 = never>(onFulfilled?: ((value: Result<TData, TError>) => TResult1 | PromiseLike<TResult1>) | null | undefined, onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onRejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null | undefined): Promise<Result<TData, TError> | TResult>;
    finally(onFinally?: (() => void) | null | undefined): Promise<Result<TData, TError>>;
    map<TNewData>(callback: (data: TData) => TNewData): ResultAsync<TNewData, TError>;
    mapAsync<TNewData>(callback: (data: TData) => Promise<TNewData>): ResultAsync<TNewData, TError>;
    andThen<TNewData, TNewError>(callback: (data: TData) => Result<TNewData, TNewError>): ResultAsync<TNewData, TError | TNewError>;
    andThenAsync<TNewData, TNewError>(callback: (data: TData) => PromiseLike<Result<TNewData, TNewError>>): ResultAsync<TNewData, TError | TNewError>;
}
export {};
