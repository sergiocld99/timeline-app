export type Location = {
  _id: string
  name: string
  latitude: number
  longitude: number
  zipcode: string
  notes: string
}

export type Travel = {
  _id: string
  startTime: string
  endTime: string
  origin: Location
  destination: Location
  modeOfTransport: string
  distance: number
  shortDate: string
  duration: number
  speed: number
}