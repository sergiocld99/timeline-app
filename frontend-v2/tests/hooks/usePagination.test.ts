import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import usePagination from "@/hooks/usePagination";

const makeItems = (length: number) => Array.from({ length }, (_, i) => i + 1);

afterEach(cleanup);

describe("usePagination", () => {
  it("starts on the first page and returns the first slice of items", () => {
    const { result } = renderHook(() => usePagination(makeItems(350)));

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(7);
    expect(result.current.pageItems).toHaveLength(50);
    expect(result.current.pageItems[0]).toBe(1);
  });

  it("goToPage navigates to a given page and slices items", () => {
    const { result } = renderHook(() => usePagination(makeItems(350)));

    act(() => result.current.goToPage(7));

    expect(result.current.page).toBe(7);
    expect(result.current.pageItems).toHaveLength(50);
    expect(result.current.pageItems[0]).toBe(301);
  });

  it("clamps out-of-range pages instead of panicking", () => {
    const { result } = renderHook(() => usePagination(makeItems(90)));

    act(() => result.current.goToPage(99));
    expect(result.current.page).toBe(2);

    act(() => result.current.goToPage(-5));
    expect(result.current.page).toBe(1);
  });

  it("next/prev walk one step and clamp at the edges", () => {
    const { result } = renderHook(() => usePagination(makeItems(350)));

    act(() => result.current.goToPage(7));
    act(() => result.current.next());
    expect(result.current.page).toBe(7);

    act(() => result.current.prev());
    expect(result.current.page).toBe(6);

    act(() => result.current.goToPage(1));
    act(() => result.current.prev());
    expect(result.current.page).toBe(1);
  });

  it("resets to page 1 when the filter shrinks the list below the current page", () => {
    const { result, rerender } = renderHook(
      ({ items }) => usePagination(items),
      { initialProps: { items: makeItems(350) } },
    );

    act(() => result.current.goToPage(7));
    expect(result.current.page).toBe(7);

    act(() => rerender({ items: makeItems(90) }));

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.pageItems).toHaveLength(50);
  });

  it("returns the remainder slice on the last page and handles empty lists", () => {
    const { result } = renderHook(() => usePagination(makeItems(90)));

    act(() => result.current.goToPage(2));
    expect(result.current.pageItems).toHaveLength(40);
    expect(result.current.pageItems[0]).toBe(51);

    const empty = renderHook(() => usePagination([]));
    expect(empty.result.current.totalPages).toBe(1);
    expect(empty.result.current.pageItems).toHaveLength(0);
  });
});