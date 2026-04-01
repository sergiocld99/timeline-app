import type { Location } from "@/types/location";

export const renderLocationWithZipcode = (location: Location) => {
  return `${location.zipcode} - ${location.name}`
}