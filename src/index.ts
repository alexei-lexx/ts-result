class SuccessResult<TData, TError = never> {
  public readonly success = true as const;

  constructor(public readonly data: TData) {}

  map<TNewData>(callback: (data: TData) => TNewData): Result<TNewData, TError> {
    return new SuccessResult(callback(this.data));
  }

  mapAsync<TNewData>(
    callback: (data: TData) => Promise<TNewData>,
  ): ResultAsync<TNewData, TError> {
    return new ResultAsync(callback(this.data).then(Success));
  }

  unwrapOrThrowAs<TThrowable extends Error>(
    _throwableClass: new (error: TError) => TThrowable,
  ) {
    return this.data;
  }
}

class FailureResult<TData = never, TError = string> {
  public readonly success = false as const;

  constructor(public readonly error: TError) {}

  map<TNewData>(
    _callback: (data: TData) => TNewData,
  ): Result<TNewData, TError> {
    return Failure(this.error);
  }

  mapAsync<TNewData>(
    _callback: (data: TData) => Promise<TNewData>,
  ): ResultAsync<TNewData, TError> {
    return new ResultAsync(Promise.resolve(Failure(this.error)));
  }

  unwrapOrThrowAs<TThrowable extends Error>(
    throwableClass: new (error: TError) => TThrowable,
  ): never {
    throw new throwableClass(this.error);
  }
}

export type Result<TData, TError = string> =
  SuccessResult<TData, TError> | FailureResult<TData, TError>;

export function Success<TData>(data: TData): Result<TData, never> {
  return new SuccessResult(data);
}

export function Failure<TError = string>(error: TError): Result<never, TError> {
  return new FailureResult(error);
}

export const Result = {
  fromThrowable<TData, TThrowable extends Error>(
    throwableClass: new (...args: never[]) => TThrowable,
    throwableFunc: () => TData,
  ): Result<TData, string> {
    try {
      return Success(throwableFunc());
    } catch (error) {
      if (error instanceof throwableClass) {
        return Failure(error.message);
      }

      throw error;
    }
  },
};

export class ResultAsync<TData, TError = string> implements PromiseLike<
  Result<TData, TError>
> {
  constructor(private readonly promise: Promise<Result<TData, TError>>) {}

  then<TResult1 = Result<TData, TError>, TResult2 = never>(
    onFulfilled?:
      | ((value: Result<TData, TError>) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onRejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onFulfilled, onRejected);
  }

  catch<TResult = never>(
    onRejected?:
      ((reason: unknown) => TResult | PromiseLike<TResult>) | null | undefined,
  ): Promise<Result<TData, TError> | TResult> {
    return this.promise.catch(onRejected);
  }

  finally(
    onFinally?: (() => void) | null | undefined,
  ): Promise<Result<TData, TError>> {
    return this.promise.finally(onFinally);
  }

  map<TNewData>(
    callback: (data: TData) => TNewData,
  ): ResultAsync<TNewData, TError> {
    return new ResultAsync(this.promise.then((result) => result.map(callback)));
  }

  mapAsync<TNewData>(
    callback: (data: TData) => Promise<TNewData>,
  ): ResultAsync<TNewData, TError> {
    return new ResultAsync(
      this.promise.then((result) => result.mapAsync(callback)),
    );
  }
}
