import travelEventEmitter from "../events/travelEvents.js";
import { TRAVEL_UPDATED } from "../events/constants.js";
import { updateVisitFromTravel } from "../services/visitService.js";

travelEventEmitter.on(TRAVEL_UPDATED, async (travel) => {
  console.log('Received event: ', TRAVEL_UPDATED, travel.origin)

  try {
    await updateVisitFromTravel(travel);
  } catch (error) {
    console.error('Error updating visit:', error);
  }
});
