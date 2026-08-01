package com.timeline.stats.service;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.dto.LocatedTravelDTO;
import com.timeline.stats.dto.PlacesVisitedDTO;
import com.timeline.stats.dto.StatsContextDTO;
import com.timeline.stats.dto.StatsTotalsDTO;
import com.timeline.stats.dto.TopRouteDTO;
import com.timeline.stats.dto.TravelStatsDTO;
import com.timeline.stats.dto.TravelDTO;
import com.timeline.stats.repository.TravelRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;

/**
 * Service for calculating travel statistics
 */
@ApplicationScoped
public class StatsService {

  public static final String ROUTE_SEPARATOR = " ↔ ";

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
    PlacesVisitedDTO placesVisited = new PlacesVisitedDTO(zipcodes, placesService.getPlaceInfoByZipcode(context));

    Set<String> uniqueDays = new HashSet<>();
    Set<String> uniqueRoutes = new HashSet<>();

    int travelCount = context.locatedTravels.size();
    StatsTotalsDTO totals = new StatsTotalsDTO();

    for (LocatedTravelDTO locatedTravel : context.locatedTravels) {
      Travel travel = locatedTravel.travel();
      Location originRef = locatedTravel.origin();
      Location destRef = locatedTravel.destination();

      travel.enrich();
      totals.addDistance(Objects.requireNonNull(travel.distance));
      totals.addMinutes(Objects.requireNonNull(travel.duration));
      uniqueDays.add(travel.date);

      if (originRef != null) {
        totals.addCoordinateAccumulation(originRef.latitude, originRef.longitude, travel.duration);
      }

      if (destRef != null) {
        totals.addCoordinateAccumulation(destRef.latitude, destRef.longitude, travel.duration);
      }

      // UNIQUE ROUTE
      if (originRef != null && destRef != null) {
        List<String> routeZipcodes = Arrays.asList(originRef.zipcode, destRef.zipcode);
        routeZipcodes.sort((a, b) -> a.compareTo(b));
        uniqueRoutes.add(String.join("-", routeZipcodes));
      }
    }

    return new TravelStatsDTO(travelCount, totals, placesVisited, uniqueDays.size(), uniqueRoutes.size());
  }

  public TravelStatsDTO calculateBasicStatsFromIds(List<TravelDTO> dtos) {
    StatsContextDTO context = getContextFromIds(dtos);
    return calculateBasicStatsFromContext(context);
  }

  public StatsContextDTO getContextFromIds(List<TravelDTO> dtos) {
    CompletableFuture<List<Travel>> travelsFuture = CompletableFuture
        .supplyAsync(() -> travelRepository.findByIds(dtos.stream().map(t -> t.id()).toList()));

    CompletableFuture<List<Location>> locationsFuture = CompletableFuture
        .supplyAsync(() -> placesService.getLocationsFromDTOs(dtos));

    // Wait for both to complete
    List<Travel> travels = travelsFuture.join();
    List<Location> locations = locationsFuture.join();

    return new StatsContextDTO(travels, locations);
  }

  /**
   * Picks the location that appears most often across the top-2 routes by
   * frequency, out of the given top routes (already sorted by count desc).
   * Ported from backend/services/routeService.js::calculateHome.
   */
  public String calculateHome(List<TopRouteDTO> topRoutes) {
    if (topRoutes.isEmpty()) {
      return null;
    }

    List<String> candidates = new ArrayList<>();
    addRouteEndpoints(topRoutes.get(0), candidates);
    if (topRoutes.size() > 1) {
      addRouteEndpoints(topRoutes.get(1), candidates);
    }

    String bestCompetitor = null;
    long maxAppearances = -1;

    for (String competitor : candidates) {
      long appearances = topRoutes.stream().filter(r -> r.route.contains(competitor)).count();
      if (appearances > maxAppearances) {
        maxAppearances = appearances;
        bestCompetitor = competitor;
      }
    }

    return bestCompetitor;
  }

  private void addRouteEndpoints(TopRouteDTO route, List<String> candidates) {
    for (String endpoint : route.route.split(Pattern.quote(ROUTE_SEPARATOR))) {
      if (!candidates.contains(endpoint)) {
        candidates.add(endpoint);
      }
    }
  }
}
