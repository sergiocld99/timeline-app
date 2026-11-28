import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useTravels from "@/hooks/useTravels";

const { travelServiceMock, dateRange, user } = vi.hoisted(() => ({
  travelServiceMock: { getAll: vi.fn() },
  // Stable object identities: useTravels' refetch callback depends on them.
  dateRange: { dateFrom: "2026-01-01T00:00", dateTo: "2026-01-31T20:59" },
  user: { currentUser: { userId: 2 }, loading: false },
}));

vi.mock("@/contexts/DateRangeContext", () => ({
  useDateRange: () => dateRange,
}));

vi.mock("@/contexts/UserContext", () => ({
  useUser: () => user,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/services/TravelService", () => ({
  default: travelServiceMock,
}));

beforeEach(() => {
  travelServiceMock.getAll.mockReset();
  travelServiceMock.getAll.mockResolvedValue({ travels: [] });
});

afterEach(cleanup);

describe("useTravels modeOfTransport filter", () => {
  it("forwards the requested mode to the service", async () => {
    const { result } = renderHook(() => useTravels('duration', '', '', 'bus', true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(travelServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(travelServiceMock.getAll).toHaveBeenCalledWith(expect.objectContaining({
      dateFrom: "2026-01-01T00:00",
      dateTo: "2026-01-31T20:59",
      modeOfTransport: "bus",
      includeByLine: true,
      userId: 2,
    }));
  });

  it("sends no mode filter by default", async () => {
    renderHook(() => useTravels());

    await waitFor(() => expect(travelServiceMock.getAll).toHaveBeenCalledTimes(1));

    expect(travelServiceMock.getAll).toHaveBeenCalledWith(expect.objectContaining({
      modeOfTransport: '',
      includeByLine: false,
    }));
  });
});
