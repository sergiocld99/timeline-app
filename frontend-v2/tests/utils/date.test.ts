import { describe, expect, it } from "vitest";

import { formatDayMonthYear } from "@/utils/date";

describe("formatDayMonthYear", () => {
  it("reads baked midnight boundaries as literal wall-clock digits (April 1 stays April 1)", () => {
    expect(formatDayMonthYear("2026-04-01T00:00:00.000Z")).toBe("01/04/2026");
  });

  it("reads baked end-of-day boundaries as literal wall-clock digits", () => {
    expect(formatDayMonthYear("2026-04-30T23:59:59.999Z")).toBe("30/04/2026");
  });

  it("reads default rolling-window real instants (Argentina-midnight) via local getters in any timezone", () => {
    expect(formatDayMonthYear("2026-04-01T03:00:00.000Z")).toBe("01/04/2026");
  });

  it("handles empty input", () => {
    expect(formatDayMonthYear(undefined)).toBe("");
    expect(formatDayMonthYear("")).toBe("");
  });
});