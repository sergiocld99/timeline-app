import { Location } from "@/types/travel"

export const renderLocationWithZipcode = (location: Location) => {
  return `${location.zipcode} - ${location.name}`
}