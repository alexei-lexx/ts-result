import { expect } from "vitest";
expect.extend({
    toBeSuccess(received, expected) {
        if (!received.success) {
            return {
                pass: false,
                message: () => `expected Success, got Failure(${JSON.stringify(received.error)})`,
            };
        }
        if (arguments.length < 2) {
            return { pass: true, message: () => "" };
        }
        const pass = this.equals(received.data, expected);
        return {
            pass,
            message: () => this.utils.diff(expected, received.data) ?? "",
        };
    },
    toBeFailure(received, expected) {
        if (received.success) {
            return {
                pass: false,
                message: () => `expected Failure, got Success(${JSON.stringify(received.data)})`,
            };
        }
        const pass = this.equals(received.error, expected);
        return {
            pass,
            message: () => this.utils.diff(expected, received.error) ?? "",
        };
    },
});
