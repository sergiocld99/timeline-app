export const sortLocationsByZipcode = (locations) => {
  return locations.sort((l1, l2) => l1.zipcode?.localeCompare(l2.zipcode));
}