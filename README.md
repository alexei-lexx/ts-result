# ts-result

A lightweight `Result<TData, TError>` type for TypeScript.
Model success and failure as values, instead of throwing exceptions.
Includes matching vitest matchers.

## Install

```
npm install github:alexei-lexx/ts-result
```

## Usage

```ts
import { Result, Success, Failure } from "ts-result";

function parse(input: string): Result<number, string> {
  const value = Number(input);
  return Number.isNaN(value) ? Failure("not a number") : Success(value);
}

const result = parse("42").map((n) => n * 2);

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

`Result.fromThrowable` wraps a throwing function,
catching a given error class and converting it into a `Failure`:

```ts
// JSON.parse throws SyntaxError on invalid input
const result = Result.fromThrowable(SyntaxError, () => JSON.parse(input));
```

## Vitest matchers

Register the matchers (e.g. in your vitest setup file):

```ts
import "ts-result/matchers";
```

Then use them in tests:

```ts
expect(Success({ id: 1 })).toBeSuccess({ id: 1 });
expect(Success({ id: 1 })).toBeSuccess(); // just asserts success
expect(Failure("not found")).toBeFailure("not found");
```
