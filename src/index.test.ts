import { describe, expect, it, vi } from "vitest";
import { Failure, Result, ResultAsync, Success } from "./index.js";
import "./matchers.js";

class TestError extends Error {}
class OtherError extends Error {}

describe("Success", () => {
  it("creates success result with data", () => {
    expect(Success({ id: 1 })).toBeSuccess({ id: 1 });
  });

  describe("map", () => {
    it("transforms data", () => {
      expect(Success({ id: 1 }).map((data) => data.id)).toBeSuccess(1);
    });
  });

  describe("mapAsync", () => {
    it("transforms data with async callback", async () => {
      // Act
      const result = await Success({ id: 1 }).mapAsync(async (data) => data.id);

      // Assert
      expect(result).toBeSuccess(1);
    });

    it("allows map on async result", async () => {
      // Act
      const result = await Success({ id: 1 })
        .mapAsync(async (data) => data.id)
        .map((id) => id + 1);

      // Assert
      expect(result).toBeSuccess(2);
    });

    it("fails when callback rejects", async () => {
      // Arrange
      const callback = () => Promise.reject(new TestError("boom"));

      // Act & Assert
      await expect(Success({ id: 1 }).mapAsync(callback)).rejects.toThrow(
        TestError,
      );
    });
  });

  describe("andThen", () => {
    // Happy path

    it("returns callback success", () => {
      expect(
        Success({ id: 1 }).andThen((data) => Success(data.id)),
      ).toBeSuccess(1);
    });

    it("returns callback failure", () => {
      expect(
        Success({ id: 1 }).andThen(() => Failure("not found")),
      ).toBeFailure("not found");
    });

    // Dependency failures

    it("fails when callback throws", () => {
      // Arrange
      const callback = () => {
        throw new TestError("boom");
      };

      // Act & Assert
      expect(() => Success({ id: 1 }).andThen(callback)).toThrow(
        new TestError("boom"),
      );
    });
  });

  describe("andThenAsync", () => {
    // Happy path

    it("returns callback success", async () => {
      // Act
      const result = await Success({ id: 1 }).andThenAsync(async (data) =>
        Success(data.id),
      );

      // Assert
      expect(result).toBeSuccess(1);
    });

    it("accepts callback returning async result", async () => {
      // Act
      const result = await Success({ id: 1 }).andThenAsync(
        (data) => new ResultAsync(Promise.resolve(Success(data.id + 1))),
      );

      // Assert
      expect(result).toBeSuccess(2);
    });

    it("allows andThen on async result", async () => {
      // Act
      const result = await Success({ id: 1 })
        .andThenAsync(async (data) => Success(data.id))
        .andThen((id) => Success(id + 1));

      // Assert
      expect(result).toBeSuccess(2);
    });

    it("returns callback failure", async () => {
      // Act
      const result = await Success({ id: 1 }).andThenAsync(async () =>
        Failure("not found"),
      );

      // Assert
      expect(result).toBeFailure("not found");
    });

    // Dependency failures

    it("fails when callback rejects", async () => {
      // Arrange
      const error = new Error("boom");
      const callback = () => Promise.reject(error);

      // Act & Assert
      await expect(Success({ id: 1 }).andThenAsync(callback)).rejects.toBe(
        error,
      );
    });
  });

  describe("unwrapOrThrowAs", () => {
    it("returns data", () => {
      expect(Success({ id: 1 }).unwrapOrThrowAs(TestError)).toEqual({
        id: 1,
      });
    });
  });
});

describe("Failure", () => {
  it("creates failure result with error", () => {
    expect(Failure("not found")).toBeFailure("not found");
  });

  it("propagates to result with other data type", () => {
    // Arrange
    const boolResult: Result<boolean> = Failure("not found");

    // Returns narrowed failure as is, checked by typecheck
    const numResult = (): Result<number> => {
      if (!boolResult.success) return boolResult;
      return Success(100);
    };

    // Act & Assert
    expect(numResult()).toBeFailure("not found");
  });

  describe("map", () => {
    it("returns failure unchanged without calling callback", () => {
      // Arrange
      const callback = vi.fn();

      // Act
      const result = Failure("not found").map(callback);

      // Assert
      expect(result).toBeFailure("not found");
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("mapAsync", () => {
    it("returns failure unchanged without calling callback", async () => {
      // Arrange
      const callback = vi.fn();

      // Act
      const result = await Failure("not found").mapAsync(callback);

      // Assert
      expect(result).toBeFailure("not found");
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("andThen", () => {
    // Happy path

    it("returns failure unchanged without calling callback", () => {
      // Arrange
      // Tracks calls to verify callback is skipped
      const callback = vi.fn();

      // Act
      const result = Failure("not found").andThen(callback);

      // Assert
      expect(result).toBeFailure("not found");
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("andThenAsync", () => {
    // Happy path

    it("returns failure unchanged without calling callback", async () => {
      // Arrange
      // Tracks calls to verify callback is skipped
      const callback = vi.fn();

      // Act
      const result = await Failure("not found").andThenAsync(callback);

      // Assert
      expect(result).toBeFailure("not found");
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("unwrapOrThrowAs", () => {
    it("throws given exception class with error as message", () => {
      // Arrange
      const subject = () => Failure("not found").unwrapOrThrowAs(TestError);

      // Act & Assert
      expect(subject).toThrow(TestError);
      expect(subject).toThrow("not found");
    });
  });
});

describe("Result", () => {
  describe("fromThrowable", () => {
    // Happy path

    it("returns success with callback return value", () => {
      expect(Result.fromThrowable(TestError, () => 42)).toBeSuccess(42);
    });

    // Validation failures

    it("fails when callback throws given error class", () => {
      // Act
      const result = Result.fromThrowable(TestError, () => {
        throw new TestError("invalid state");
      });

      // Assert
      expect(result).toBeFailure("invalid state");
    });

    // Dependency failures

    it("fails when callback throws unrecognized error", () => {
      // Arrange
      const subject = () =>
        Result.fromThrowable(TestError, () => {
          throw new OtherError("boom");
        });

      // Act & Assert
      expect(subject).toThrow(OtherError);
    });
  });
});

describe("ResultAsync", () => {
  describe("constructor", () => {
    // Happy path

    it("resolves to success result", async () => {
      // Arrange
      const promise = Promise.resolve(Success(100));

      // Act
      const result = await new ResultAsync(promise);

      // Assert
      expect(result).toBeSuccess(100);
    });

    it("resolves to failure result", async () => {
      // Arrange
      const promise = Promise.resolve(Failure("not found"));

      // Act
      const result = await new ResultAsync(promise);

      // Assert
      expect(result).toBeFailure("not found");
    });

    // Dependency failures

    it("fails when promise rejects", async () => {
      // Arrange
      const error = new Error("boom");
      const promise = Promise.reject(error);

      // Act & Assert
      await expect(new ResultAsync(promise)).rejects.toBe(error);
    });
  });

  describe("then", () => {
    // Happy path

    it("passes result to fulfillment callback", async () => {
      // Act
      const data = await new ResultAsync(Promise.resolve(Success(1))).then(
        (result) => (result.success ? result.data : 0),
      );

      // Assert
      expect(data).toBe(1);
    });

    // Dependency failures

    it("resolves to rejection callback value when promise rejects", async () => {
      // Arrange
      const error = new Error("boom");
      const promise = Promise.reject(error);

      // Act
      const reason = await new ResultAsync(promise).then(
        undefined,
        (rejection) => rejection,
      );

      // Assert
      expect(reason).toBe(error);
    });
  });

  describe("catch", () => {
    // Happy path

    it("resolves to result without calling callback", async () => {
      // Arrange
      // Tracks calls to verify callback is skipped
      const callback = vi.fn();

      // Act
      const result = await new ResultAsync(Promise.resolve(Success(1))).catch(
        callback,
      );

      // Assert
      expect(result).toBeSuccess(1);
      expect(callback).not.toHaveBeenCalled();
    });

    // Dependency failures

    it("resolves to callback value when promise rejects", async () => {
      // Arrange
      const error = new Error("boom");
      const promise = Promise.reject(error);

      // Act
      const reason = await new ResultAsync(promise).catch(
        (rejection) => rejection,
      );

      // Assert
      expect(reason).toBe(error);
    });
  });

  describe("finally", () => {
    // Happy path

    it("calls callback and resolves to result", async () => {
      // Arrange
      // Tracks calls to verify callback runs
      const callback = vi.fn();

      // Act
      const result = await new ResultAsync(Promise.resolve(Success(1))).finally(
        callback,
      );

      // Assert
      expect(result).toBeSuccess(1);
      expect(callback).toHaveBeenCalledOnce();
    });

    // Dependency failures

    it("fails after calling callback when promise rejects", async () => {
      // Arrange
      // Tracks calls to verify callback runs
      const callback = vi.fn();
      const error = new Error("boom");
      const promise = Promise.reject(error);

      // Act & Assert
      await expect(new ResultAsync(promise).finally(callback)).rejects.toBe(
        error,
      );
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe("map", () => {
    // Happy path

    it("transforms data", async () => {
      // Act
      const result = await new ResultAsync(Promise.resolve(Success(3))).map(
        (data) => data ** 2,
      );

      // Assert
      expect(result).toBeSuccess(9);
    });

    it("returns failure unchanged without calling callback", async () => {
      // Arrange
      // Tracks calls to verify callback is skipped
      const callback = vi.fn();

      // Act
      const result = await new ResultAsync(
        Promise.resolve(Failure("not found")),
      ).map(callback);

      // Assert
      expect(result).toBeFailure("not found");
      expect(callback).not.toHaveBeenCalled();
    });

    // Dependency failures

    it("fails without calling callback when promise rejects", async () => {
      // Arrange
      // Tracks calls to verify callback is skipped
      const callback = vi.fn();
      const error = new Error("boom");
      const promise = Promise.reject(error);

      // Act & Assert
      await expect(new ResultAsync(promise).map(callback)).rejects.toBe(error);
      expect(callback).not.toHaveBeenCalled();
    });

    it("fails when callback throws", async () => {
      // Arrange
      const error = new Error("boom");
      const callback = () => {
        throw error;
      };
      const resultAsync = new ResultAsync(Promise.resolve(Success({ id: 1 })));

      // Act & Assert
      await expect(resultAsync.map(callback)).rejects.toBe(error);
    });
  });

  describe("mapAsync", () => {
    // Happy path

    it("transforms data with async callback", async () => {
      // Act
      const result = await new ResultAsync(
        Promise.resolve(Success(3)),
      ).mapAsync(async (data) => data ** 2);

      // Assert
      expect(result).toBeSuccess(9);
    });

    it("returns failure unchanged without calling callback", async () => {
      // Arrange
      // Tracks calls to verify callback is skipped
      const callback = vi.fn();

      // Act
      const result = await new ResultAsync(
        Promise.resolve(Failure("not found")),
      ).mapAsync(callback);

      // Assert
      expect(result).toBeFailure("not found");
      expect(callback).not.toHaveBeenCalled();
    });

    // Dependency failures

    it("fails when callback rejects", async () => {
      // Arrange
      const error = new Error("boom");
      const callback = () => Promise.reject(error);
      const resultAsync = new ResultAsync(Promise.resolve(Success({ id: 1 })));

      // Act & Assert
      await expect(resultAsync.mapAsync(callback)).rejects.toBe(error);
    });
  });

  describe("andThen", () => {
    // Happy path

    it("returns callback success", async () => {
      // Act
      const result = await new ResultAsync(Promise.resolve(Success(3))).andThen(
        (data) => Success(data ** 2),
      );

      // Assert
      expect(result).toBeSuccess(9);
    });

    it("returns failure unchanged without calling callback", async () => {
      // Arrange
      // Tracks calls to verify callback is skipped
      const callback = vi.fn();

      // Act
      const result = await new ResultAsync(
        Promise.resolve(Failure("not found")),
      ).andThen(callback);

      // Assert
      expect(result).toBeFailure("not found");
      expect(callback).not.toHaveBeenCalled();
    });

    it("returns callback failure", async () => {
      // Act
      const result = await new ResultAsync(Promise.resolve(Success(3))).andThen(
        () => Failure("not found"),
      );

      // Assert
      expect(result).toBeFailure("not found");
    });

    // Dependency failures

    it("fails without calling callback when promise rejects", async () => {
      // Arrange
      // Tracks calls to verify callback is skipped
      const callback = vi.fn();
      const error = new Error("boom");
      const promise = Promise.reject(error);

      // Act & Assert
      await expect(new ResultAsync(promise).andThen(callback)).rejects.toBe(
        error,
      );
      expect(callback).not.toHaveBeenCalled();
    });

    it("fails when callback throws", async () => {
      // Arrange
      const error = new Error("boom");
      const callback = () => {
        throw error;
      };
      const resultAsync = new ResultAsync(Promise.resolve(Success({ id: 1 })));

      // Act & Assert
      await expect(resultAsync.andThen(callback)).rejects.toBe(error);
    });
  });

  describe("andThenAsync", () => {
    // Happy path

    it("returns callback success", async () => {
      // Act
      const result = await new ResultAsync(
        Promise.resolve(Success(3)),
      ).andThenAsync(async (data) => Success(data ** 2));

      // Assert
      expect(result).toBeSuccess(9);
    });

    it("returns failure unchanged without calling callback", async () => {
      // Arrange
      // Tracks calls to verify callback is skipped
      const callback = vi.fn();

      // Act
      const result = await new ResultAsync(
        Promise.resolve(Failure("not found")),
      ).andThenAsync(callback);

      // Assert
      expect(result).toBeFailure("not found");
      expect(callback).not.toHaveBeenCalled();
    });

    it("returns callback failure", async () => {
      // Act
      const result = await new ResultAsync(
        Promise.resolve(Success(3)),
      ).andThenAsync(async () => Failure("not found"));

      // Assert
      expect(result).toBeFailure("not found");
    });

    // Dependency failures

    it("fails without calling callback when promise rejects", async () => {
      // Arrange
      // Tracks calls to verify callback is skipped
      const callback = vi.fn();
      const error = new Error("boom");
      const promise = Promise.reject(error);

      // Act & Assert
      await expect(
        new ResultAsync(promise).andThenAsync(callback),
      ).rejects.toBe(error);
      expect(callback).not.toHaveBeenCalled();
    });

    it("fails when callback rejects", async () => {
      // Arrange
      const error = new Error("boom");
      const callback = () => Promise.reject(error);
      const resultAsync = new ResultAsync(Promise.resolve(Success({ id: 1 })));

      // Act & Assert
      await expect(resultAsync.andThenAsync(callback)).rejects.toBe(error);
    });
  });
});
