import type { Travel } from "@/types/travel";

import { useEffect, useMemo, useState } from "react";

import { useMapConfig } from "@/hooks/useMapConfig";

import { DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM } from "./constants";

type Props = {
  travels: Travel[]
  count: number
  isFiltered?: boolean
}

export const useViewPoint = ({ travels, count, isFiltered }: Props) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG])
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const { mapConfig } = useMapConfig(travels);

  const isStronglyFiltered = isFiltered && count < 5

  const viewpoint = useMemo(() => {
    if (!mapConfig) return null;
    return {
      center: mapConfig.center,
      zoom: isStronglyFiltered ? mapConfig.zoom - 1 : mapConfig.zoom
    };
  }, [mapConfig, isStronglyFiltered]);

  useEffect(() => {
    if (viewpoint) {
      setZoom(viewpoint.zoom);
      setMapCenter(viewpoint.center);
    }
  }, [viewpoint]);

  return { mapCenter, zoom }
}