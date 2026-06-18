import travelEventEmitter from "../events/travelEvents.js";
import { TRAVEL_UPDATED } from "../events/constants.js";

export const emitTravelUpdated = (origin, travel) => {
  // Only emit if origin is explicit (it was updated)
  if (origin) {
    travelEventEmitter.emit(TRAVEL_UPDATED, travel);
  }
};
