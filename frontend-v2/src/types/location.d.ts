export type Location = {
  _id: string
  name: string
  latitude: number
  longitude: number
  zipcode: string
  notes: string
}

export type LocationEditValues = {
  name: string,
  zipcode: string,
  latitude: number,
  longitude: number,
  notes: string,
}
