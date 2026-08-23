import type { Center } from "@/types/map";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

const ChangeMapView = ({ center, zoom }: { center: Center, zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, map, zoom]);

  return null;
}

export default ChangeMapView