import type { Location } from "@/types/location";

export const calculateCenter = (l1: Location, l2: Location): [number, number] => {
  return [(l1.latitude + l2.latitude) / 2, (l1.longitude + l2.longitude) / 2]
}