import type { Travel } from "@/types/travel";

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import useTravelFilter from "@/hooks/useTravelFilter";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/utils/date", () => ({
  translateDay: (day: string) => day,
}));

const travel = (id: string, line?: string, modeOfTransport = "bus") =>
  ({ _id: id, line, modeOfTransport }) as unknown as Travel;

afterEach(cleanup);

describe("useTravelFilter line filter", () => {
  const travels = [
    travel("1", "152"),
    travel("2", "60"),
    travel("3", "152"),
    travel("4", "152", "car"), // a stray line on a non-bus travel must not match
    travel("5"),
  ];

  it("keeps only bus travels from the selected line and exposes it as the applied filter", () => {
    const { result } = renderHook(() => useTravelFilter(travels));

    act(() => result.current.onFilter({ type: "line", value: "152" }));

    expect(result.current.filteredTravels.map(t => t._id)).toEqual(["1", "3"]);
    expect(result.current.appliedFilter).toBe("152");
  });

  it("restores all travels when the filter is cleared", () => {
    const { result } = renderHook(() => useTravelFilter(travels));

    act(() => result.current.onFilter({ type: "line", value: "152" }));
    act(() => result.current.onFilter());

    expect(result.current.filteredTravels).toEqual(travels);
    expect(result.current.appliedFilter).toBeNull();
  });
});
