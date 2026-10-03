class SuccessResult {
    data;
    success = true;
    constructor(data) {
        this.data = data;
    }
    map(callback) {
        return new SuccessResult(callback(this.data));
    }
    async mapAsync(callback) {
        return new SuccessResult(await callback(this.data));
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
        return this;
    }
    async mapAsync(_callback) {
        return this;
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
