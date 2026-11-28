import type { StatByLine } from "@/types/stats";

import { describe, expect, it } from "vitest";

import { sortLines } from "@/components/selectors/LineSortSelector";

const stats: StatByLine[] = [
  { line: "1", count: 2, totalKm: 10, totalMinutes: 100, averageSpeed: 6 },
  { line: "2", count: 5, totalKm: 3, totalMinutes: 10, averageSpeed: 18 },
  { line: "3", count: 5, totalKm: 20, totalMinutes: 40, averageSpeed: 30 },
];

const lines = (option: Parameters<typeof sortLines>[1]) => sortLines(stats, option).map(stat => stat.line);

describe("sortLines", () => {
  it("sorts by rides and keeps backend order on ties without mutating the input", () => {
    expect(lines("rides")).toEqual(["2", "3", "1"]);
    expect(stats.map(stat => stat.line)).toEqual(["1", "2", "3"]);
  });

  it("sorts by speed", () => {
    expect(lines("speed")).toEqual(["3", "2", "1"]);
  });

  it("sorts by duration", () => {
    expect(lines("duration")).toEqual(["1", "3", "2"]);
  });

  it("sorts by km", () => {
    expect(lines("km")).toEqual(["3", "1", "2"]);
  });
});
