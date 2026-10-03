import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useCrosses from "@/hooks/useCrosses";

type MutationConfig = {
  mutationFn: (id: string) => Promise<unknown>;
  onSuccess?: (data: unknown, id: string) => void | Promise<void>;
};

const { crossServiceMock, invalidatedKeys, mutationConfigs } = vi.hoisted(() => ({
  crossServiceMock: { getAll: vi.fn(), delete: vi.fn() },
  invalidatedKeys: [] as unknown[][],
  mutationConfigs: [] as Array<MutationConfig>,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: ({ queryKey }: { queryKey: unknown[] }) => {
      invalidatedKeys.push(queryKey);
      return Promise.resolve();
    },
  }),
  useQuery: () => ({ data: [], error: null, isLoading: false }),
  useMutation: (config: MutationConfig) => {
    mutationConfigs.push(config);
    return {
      mutateAsync: async (id: string) => {
        const data = await config.mutationFn(id);
        await config.onSuccess?.(data, id);
        return data;
      },
    };
  },
}));

vi.mock("@/services/CrossService", () => ({
  default: crossServiceMock,
}));

const renderUseCrosses = () => {
  const { result } = renderHook(() => useCrosses());
  return result;
};

beforeEach(() => {
  invalidatedKeys.length = 0;
  mutationConfigs.length = 0;
  crossServiceMock.delete.mockReset();
  crossServiceMock.delete.mockResolvedValue(undefined);
});

afterEach(cleanup);

describe("useCrosses", () => {
  it("registers the remove mutation wired to CrossService.delete", async () => {
    const result = renderUseCrosses();

    await result.current.remove("cross-1");

    expect(crossServiceMock.delete).toHaveBeenCalledTimes(1);
    expect(crossServiceMock.delete).toHaveBeenCalledWith("cross-1");
  });

  it("invalidates the crosses query after a successful removal", async () => {
    const result = renderUseCrosses();

    await result.current.remove("cross-1");

    expect(invalidatedKeys).toEqual([["crosses"]]);
  });

  it("propagates the backend rejection and leaves the crosses query untouched", async () => {
    crossServiceMock.delete.mockRejectedValue({
      response: { data: { message: "Cannot delete cross: It has 1 associated travel(s)." } },
    });
    const result = renderUseCrosses();

    await expect(result.current.remove("cross-1")).rejects.toMatchObject({
      response: { data: { message: "Cannot delete cross: It has 1 associated travel(s)." } },
    });
    expect(invalidatedKeys).toEqual([]);
  });

  it("refetch invalidates the crosses query", () => {
    const result = renderUseCrosses();

    result.current.refetch();

    expect(invalidatedKeys).toEqual([["crosses"]]);
  });

  it("exposes a single remove mutation", () => {
    renderHook(() => useCrosses());

    expect(mutationConfigs).toHaveLength(1);
  });
});
