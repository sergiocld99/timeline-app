package com.timeline.stats.service;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.dto.PlacesVisitedDTO;
import com.timeline.stats.dto.TravelStatsDTO;
import com.timeline.stats.repository.TravelRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.List;
import java.util.Set;

/**
 * Service for calculating travel statistics
 */
@ApplicationScoped
public class StatsService {

  @Inject
  TravelRepository travelRepository;

  @Inject
  PlacesService placesService;

  public TravelStatsDTO calculateBasicStats(Instant dateFrom, Instant dateTo, Integer userId) {
    List<Travel> travels = travelRepository.findByDateRangeAndUser(dateFrom, dateTo, userId);
    List<Location> locations = placesService.getLocationsFromTravels(travels);
    Set<String> zipcodes = placesService.getZipcodesFromLocations(locations);
    PlacesVisitedDTO placesVisited = new PlacesVisitedDTO(zipcodes);

    double totalDistance = 0.0;
    double totalMinutes = 0.0;
    double totalLatitude = 0.0;
    double totalLongitude = 0.0;

    for (Travel travel : travels) {
      travel.enrich(); // Calculate duration and speed
      totalDistance += (travel.distance != null ? travel.distance : 0.0);
      totalMinutes += (travel.duration != null ? travel.duration : 0.0);

      Location originRef = locations.stream().filter(l -> l.id.equals(travel.origin)).findFirst().orElse(null);
      Location destRef = locations.stream().filter(l -> l.id.equals(travel.destination)).findFirst().orElse(null);

      if (originRef != null) {
        totalLatitude += originRef.latitude * travel.duration;
        totalLongitude += originRef.longitude * travel.duration;
      }

      if (destRef != null) {
        totalLatitude += destRef.latitude * travel.duration;
        totalLongitude += destRef.longitude * travel.duration;
      }
    }

    return new TravelStatsDTO(travels.size(), totalDistance, totalMinutes, totalLatitude, totalLongitude,
        placesVisited);
  }
}
