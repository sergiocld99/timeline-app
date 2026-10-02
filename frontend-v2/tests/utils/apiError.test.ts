import { describe, expect, it } from "vitest";

import { getApiErrorMessage } from "@/utils/apiError";

const t = (key: string, values?: Record<string, unknown>) =>
  `${key}${values ? `:${JSON.stringify(values)}` : ""}`;

describe("getApiErrorMessage", () => {
  it("translates the singular code formatting the blocking travel date", () => {
    const error = {
      response: {
        data: {
          message: "Cannot delete cross: Its only associated travel is from 2026-02-24.",
          name: "BusinessRuleError",
          code: "cross_has_associated_travel",
          params: { count: 1, date: "2026-02-24" },
        },
      },
    };

    expect(getApiErrorMessage(error, t, "messages.deleteError", { name: "UADE" })).toBe(
      'messages.crossHasAssociatedTravel:{"count":1,"date":"24/02/2026","name":"UADE"}'
    );
  });

  it("translates the plural code with the travels count", () => {
    const error = {
      response: {
        data: {
          message: "Cannot delete cross: It has 5 associated travels.",
          code: "cross_has_associated_travels",
          params: { count: 5 },
        },
      },
    };

    expect(getApiErrorMessage(error, t, "messages.deleteError", { name: "UADE" })).toBe(
      'messages.crossHasAssociatedTravels:{"count":5,"name":"UADE"}'
    );
  });

  it("keeps the raw param when the singular code arrives without a date", () => {
    const error = {
      response: { data: { code: "cross_has_associated_travel", params: { count: 1 } } },
    };

    expect(getApiErrorMessage(error, t, "messages.deleteError")).toBe(
      'messages.crossHasAssociatedTravel:{"count":1}'
    );
  });

  it("falls back to the backend message when the code is unknown", () => {
    const error = { response: { data: { message: "Something exploded", code: "brand_new_code" } } };

    expect(getApiErrorMessage(error, t, "messages.deleteError")).toBe("Something exploded");
  });

  it("falls back to the backend message when the error carries no code", () => {
    const error = { response: { data: { message: "Failed to remove" } } };

    expect(getApiErrorMessage(error, t, "messages.deleteError")).toBe("Failed to remove");
  });

  it("falls back to the axios error message when the response has no body message", () => {
    const error = { message: "Request failed with status code 500", response: { status: 500 } };

    expect(getApiErrorMessage(error, t, "messages.deleteError")).toBe("Request failed with status code 500");
  });

  it("falls back to the translation key when the error carries nothing", () => {
    expect(getApiErrorMessage({}, t, "messages.deleteError")).toBe("messages.deleteError");
    expect(getApiErrorMessage(undefined, t, "messages.deleteError")).toBe("messages.deleteError");
  });
});
