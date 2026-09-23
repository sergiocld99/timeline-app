import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDashQuery } from "@/hooks/useDashQuery";

const { currentUser, queryCalls, travelStatsMock, useSearchParamsMock } = vi.hoisted(() => {
  const currentUser = { userId: 2, name: "Test" };
  const queryCalls: Array<{ key: unknown[]; fn: () => Promise<unknown> }> = [];
  return {
    currentUser,
    queryCalls,
    travelStatsMock: { getDashboardStats: vi.fn() },
    useSearchParamsMock: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@/contexts/UserContext", () => ({
  useUser: () => ({ currentUser, loading: false }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (config: { queryKey: unknown[]; queryFn: () => Promise<unknown> }) => {
    queryCalls.push({ key: config.queryKey, fn: config.queryFn });
    return { data: undefined, isLoading: false, error: null };
  },
}));

vi.mock("@/services/TravelService", () => ({
  default: { getDashboardStats: travelStatsMock.getDashboardStats },
}));

const shiftYearBack = (iso: string): string => {
  const date = new Date(iso);
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString();
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  result.setDate(1);
  result.setMonth(targetMonth);
  const maxDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(date.getDate(), maxDay));
  return result;
};

beforeEach(() => {
  queryCalls.length = 0;
  travelStatsMock.getDashboardStats.mockReset();
  travelStatsMock.getDashboardStats.mockResolvedValue({});
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useDashQuery", () => {
  it("defaults to the rolling 11-month window when from/to are absent", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T12:00:00.000Z"));

    const { result } = renderHook(() => useDashQuery());

    expect(result.current.currentTo).toBe("2026-09-14T12:00:00.000Z");

    const fromReplica = new Date(result.current.currentTo);
    fromReplica.setDate(1);
    fromReplica.setMonth(fromReplica.getMonth() - 10);
    fromReplica.setHours(0, 0, 0, 0);
    expect(result.current.currentFrom).toBe(fromReplica.toISOString());

    expect(queryCalls).toHaveLength(2);
    const [currentQuery, prevQuery] = queryCalls;
    expect(currentQuery.key).toEqual(["home_stats", result.current.currentFrom, result.current.currentTo, currentUser]);
    expect(prevQuery.key[0]).toBe("home_stats_prev");
    expect(prevQuery.key[1]).toBe(shiftYearBack(result.current.currentFrom));
    expect(prevQuery.key[2]).toBe(shiftYearBack(result.current.currentTo));
  });

  it("pages the default view with ?offset=", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T12:00:00.000Z"));
    useSearchParamsMock.mockReturnValue(new URLSearchParams("offset=3"));

    const { result } = renderHook(() => useDashQuery());

    expect(result.current.currentTo).toBe(addMonths(new Date("2026-09-14T12:00:00.000Z"), 3).toISOString());
  });

  it("uses ?from&?to verbatim and derives the previous period one year back", () => {
    const fromParam = "2026-03-01T00:00:00.000Z";
    const toParam = "2026-06-30T23:59:59.999Z";
    useSearchParamsMock.mockReturnValue(new URLSearchParams(`from=${fromParam}&to=${toParam}`));

    const { result } = renderHook(() => useDashQuery());

    expect(result.current.currentFrom).toBe(fromParam);
    expect(result.current.currentTo).toBe(toParam);

    const [currentQuery, prevQuery] = queryCalls;
    expect(currentQuery.key[1]).toBe(fromParam);
    expect(currentQuery.key[2]).toBe(toParam);
    expect(prevQuery.key[0]).toBe("home_stats_prev");
    expect(prevQuery.key[1]).toBe(shiftYearBack(fromParam));
    expect(prevQuery.key[2]).toBe(shiftYearBack(toParam));
  });

  it("ignores ?offset when an explicit range is present", () => {
    const fromParam = "2026-03-01T00:00:00.000Z";
    const toParam = "2026-03-31T23:59:59.999Z";
    useSearchParamsMock.mockReturnValue(new URLSearchParams(`from=${fromParam}&to=${toParam}&offset=5`));

    const { result } = renderHook(() => useDashQuery());

    expect(result.current.currentFrom).toBe(fromParam);
    expect(result.current.currentTo).toBe(toParam);
  });

  it("expands date-only from/to params to baked start/end-of-day boundaries", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("from=2026-03-01&to=2026-06-30"));

    const { result } = renderHook(() => useDashQuery());

    expect(result.current.currentFrom).toBe("2026-03-01T00:00:00.000Z");
    expect(result.current.currentTo).toBe("2026-06-30T23:59:59.999Z");
  });

  it("caps an explicit range wider than 11 months at from + 11 months", () => {
    const fromParam = "2020-01-01T00:00:00.000Z";
    const toParam = "2021-12-31T23:59:59.999Z";
    useSearchParamsMock.mockReturnValue(new URLSearchParams(`from=${fromParam}&to=${toParam}`));

    const { result } = renderHook(() => useDashQuery());

    expect(result.current.currentFrom).toBe(fromParam);
    expect(result.current.currentTo).toBe(addMonths(new Date(fromParam), 11).toISOString());
    expect(new Date(result.current.currentTo).getTime()).toBeLessThan(new Date(toParam).getTime());
  });

  it("falls back to the rolling window when from/to are unparseable or reversed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T12:00:00.000Z"));

    useSearchParamsMock.mockReturnValue(new URLSearchParams("from=not-a-date&to=2026-03-31T23:59:59.999Z"));
    const invalid = renderHook(() => useDashQuery());
    expect(invalid.result.current.currentTo).toBe("2026-09-14T12:00:00.000Z");

    useSearchParamsMock.mockReturnValue(new URLSearchParams("from=2026-06-01T00:00:00.000Z&to=2026-05-31T23:59:59.999Z"));
    const reversed = renderHook(() => useDashQuery());
    expect(reversed.result.current.currentTo).toBe("2026-09-14T12:00:00.000Z");
  });

  it("queries the stats service with the current range and userId", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("from=2026-03-01T00:00:00.000Z&to=2026-06-30T23:59:59.999Z"));

    const { result } = renderHook(() => useDashQuery());

    await queryCalls[0].fn();

    expect(travelStatsMock.getDashboardStats).toHaveBeenCalledWith(
      result.current.currentFrom,
      result.current.currentTo,
      currentUser.userId
    );

    await queryCalls[1].fn();
    expect(travelStatsMock.getDashboardStats).toHaveBeenCalledTimes(2);
  });
});