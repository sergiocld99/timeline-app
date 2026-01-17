package com.timeline.stats.service;

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
    Set<String> zipcodes = placesService.getZipcodesFromTravels(travels);

    double totalDistance = 0.0;
    double totalMinutes = 0.0;

    for (Travel travel : travels) {
      travel.enrich(); // Calculate duration and speed
      totalDistance += (travel.distance != null ? travel.distance : 0.0);
      totalMinutes += (travel.duration != null ? travel.duration : 0.0);
    }

    PlacesVisitedDTO placesVisited = new PlacesVisitedDTO(zipcodes);

    return new TravelStatsDTO(travels.size(), totalDistance, totalMinutes, placesVisited);
  }
}
