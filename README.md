# ts-result

A lightweight `Result<TData, TError>` type for TypeScript.
Model success and failure as values, instead of throwing exceptions.
Includes matching vitest matchers.

## Install

```
npm install github:alexei-lexx/ts-result
```

Pin a tag instead of `main` for a stable install.

```
npm install github:alexei-lexx/ts-result#v0.2.0
```

## Usage

```ts
import { Result, Success, Failure } from "ts-result";

function parse(input: string): Result<number, string> {
  const value = Number(input);
  return Number.isNaN(value) ? Failure("not a number") : Success(value);
}

const result = parse("42");

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

`map` transforms the data of a success.
A failure passes through unchanged, and the callback is not called:

```ts
const result = parse("42").map((value) => value * 2);
```

`mapAsync` works like `map` with an async callback.
It returns a `ResultAsync`, which you can `await` like a `Promise`:

```ts
const result = await parse("42")
  .mapAsync(async (userId) => fetchUser(userId))
  .map((user) => user.name);
```

`andThen` chains a callback that returns its own `Result`.
A failure from either step ends the chain:

```ts
const result = parse("42").andThen((value) =>
  value > 0 ? Success(value) : Failure("not positive"),
);
```

`andThenAsync` works like `andThen` with an async callback.
The callback can return a `Promise` or a `ResultAsync`:

```ts
const result = await parse("42").andThenAsync(async (userId) =>
  fetchUser(userId),
);
```

`Result.fromThrowable` wraps a throwing function,
catching a given error class and converting it into a `Failure`:

```ts
// JSON.parse throws SyntaxError on invalid input
const result = Result.fromThrowable(SyntaxError, () => JSON.parse(input));
```

## Vitest matchers

Create a setup file that imports the matchers:

```ts
// vitest.setup.ts
import "ts-result/matchers";
```

Then register it in your Vitest config:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

Then use them in tests:

```ts
expect(Success({ id: 1 })).toBeSuccess({ id: 1 });
expect(Success({ id: 1 })).toBeSuccess(); // just asserts success
expect(Failure("not found")).toBeFailure("not found");
```
