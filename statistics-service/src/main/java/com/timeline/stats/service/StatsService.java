package com.timeline.stats.service;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.dto.LocatedTravelDTO;
import com.timeline.stats.dto.PlacesVisitedDTO;
import com.timeline.stats.dto.StatsContextDTO;
import com.timeline.stats.dto.TravelStatsDTO;
import com.timeline.stats.dto.TravelDTO;
import com.timeline.stats.repository.TravelRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

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

    return calculateBasicStats(travels);
  }

  public TravelStatsDTO calculateBasicStats(List<Travel> travels) {
    List<Location> locations = placesService.getLocationsFromTravels(travels);
    StatsContextDTO context = new StatsContextDTO(travels, locations);

    return calculateBasicStatsFromContext(context);
  }

  public TravelStatsDTO calculateBasicStatsFromContext(StatsContextDTO context) {
    Set<String> zipcodes = placesService.getZipcodesFromLocations(context.locations);
    PlacesVisitedDTO placesVisited = new PlacesVisitedDTO(zipcodes);

    int travelCount = context.locatedTravels.size();
    double totalDistance = 0.0;
    double totalMinutes = 0.0;
    double totalLatitude = 0.0;
    double totalLongitude = 0.0;

    for (LocatedTravelDTO locatedTravel : context.locatedTravels) {
      Travel travel = locatedTravel.travel();
      Location originRef = locatedTravel.origin();
      Location destRef = locatedTravel.destination();

      travel.enrich();
      totalDistance += (travel.distance != null ? travel.distance : 0.0);
      totalMinutes += (travel.duration != null ? travel.duration : 0.0);

      if (originRef != null) {
        totalLatitude += originRef.latitude * travel.duration;
        totalLongitude += originRef.longitude * travel.duration;
      }

      if (destRef != null) {
        totalLatitude += destRef.latitude * travel.duration;
        totalLongitude += destRef.longitude * travel.duration;
      }
    }

    return new TravelStatsDTO(travelCount, totalDistance, totalMinutes, totalLatitude, totalLongitude,
        placesVisited);
  }

  public TravelStatsDTO calculateBasicStatsFromIds(List<TravelDTO> dtos) {
    CompletableFuture<List<Travel>> travelsFuture = CompletableFuture
        .supplyAsync(() -> travelRepository.findByIds(dtos.stream().map(t -> t.id()).toList()));

    CompletableFuture<List<Location>> locationsFuture = CompletableFuture
        .supplyAsync(() -> placesService.getLocationsFromDTOs(dtos));

    // Wait for both to complete
    List<Travel> travels = travelsFuture.join();
    List<Location> locations = locationsFuture.join();

    StatsContextDTO context = new StatsContextDTO(travels, locations);
    return calculateBasicStatsFromContext(context);
  }
}
