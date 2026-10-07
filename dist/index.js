class SuccessResult {
    data;
    success = true;
    constructor(data) {
        this.data = data;
    }
    map(callback) {
        return new SuccessResult(callback(this.data));
    }
    mapAsync(callback) {
        return new ResultAsync(callback(this.data).then((newData) => Success(newData)));
    }
    unwrapOrThrowAs(_throwableClass) {
        return this.data;
    }
}
class FailureResult {
    error;
    success = false;
    constructor(error) {
        this.error = error;
    }
    map(_callback) {
        return Failure(this.error);
    }
    mapAsync(_callback) {
        return new ResultAsync(Promise.resolve(Failure(this.error)));
    }
    unwrapOrThrowAs(throwableClass) {
        throw new throwableClass(this.error);
    }
}
export function Success(data) {
    return new SuccessResult(data);
}
export function Failure(error) {
    return new FailureResult(error);
}
export const Result = {
    fromThrowable(throwableClass, throwableFunc) {
        try {
            return Success(throwableFunc());
        }
        catch (error) {
            if (error instanceof throwableClass) {
                return Failure(error.message);
            }
            throw error;
        }
    },
};
export class ResultAsync {
    promise;
    constructor(promise) {
        this.promise = promise;
    }
    then(onFulfilled, onRejected) {
        return this.promise.then(onFulfilled, onRejected);
    }
    catch(onRejected) {
        return this.promise.catch(onRejected);
    }
    finally(onFinally) {
        return this.promise.finally(onFinally);
    }
    map(callback) {
        return new ResultAsync(this.promise.then((result) => result.map(callback)));
    }
    mapAsync(callback) {
        return new ResultAsync(this.promise.then((result) => result.mapAsync(callback)));
    }
}
