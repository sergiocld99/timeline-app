package com.timeline.stats.service;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.dto.DashboardStatsDTO;
import com.timeline.stats.dto.LocatedTravelDTO;
import com.timeline.stats.dto.MonthlyStatDTO;
import com.timeline.stats.dto.StatsContextDTO;
import com.timeline.stats.dto.TopRouteDTO;
import com.timeline.stats.dto.TravelStatsDTO;
import com.timeline.stats.repository.TravelRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Service for calculating dashboard-specific statistics: monthly breakdown,
 * top routes and home location, on top of the shared basic stats.
 */
@ApplicationScoped
public class DashboardService {

  private static final int TOP_ROUTES_LIMIT = 5;

  @Inject
  TravelRepository travelRepository;

  @Inject
  PlacesService placesService;

  @Inject
  StatsService statsService;

  public DashboardStatsDTO calculateDashboardStats(Instant dateFrom, Instant dateTo, Integer userId) {
    List<Travel> travels = travelRepository.findByDateRangeAndUser(dateFrom, dateTo, userId);
    List<Location> locations = placesService.getLocationsFromTravels(travels);
    StatsContextDTO context = new StatsContextDTO(travels, locations);

    TravelStatsDTO baseStats = statsService.calculateBasicStatsFromContext(context);

    // TreeMap so the "YYYY-MM" keys come out chronologically for any consumer
    Map<String, MonthlyStatDTO> monthlyStats = new TreeMap<>();
    Map<String, Integer> routeCounts = new HashMap<>();

    for (LocatedTravelDTO locatedTravel : context.locatedTravels) {
      Travel travel = locatedTravel.travel();
      Location origin = locatedTravel.origin();
      Location destination = locatedTravel.destination();

      travel.enrich();
      String monthKey = travel.date.substring(0, 7);
      MonthlyStatDTO monthStat = monthlyStats.computeIfAbsent(monthKey, key -> new MonthlyStatDTO());
      monthStat.km += travel.distance;
      monthStat.minutes += travel.duration;
      monthStat.count += 1;

      if (origin != null && destination != null) {
        List<String> sortedNames = new ArrayList<>(List.of(origin.name, destination.name));
        sortedNames.sort(String::compareTo);
        String routeKey = sortedNames.get(0) + StatsService.ROUTE_SEPARATOR + sortedNames.get(1);
        routeCounts.merge(routeKey, 1, Integer::sum);

        if (!monthStat.zipcodes.contains(origin.zipcode)) {
          monthStat.zipcodes.add(origin.zipcode);
        }
        if (!monthStat.zipcodes.contains(destination.zipcode)) {
          monthStat.zipcodes.add(destination.zipcode);
        }

        if (destination.zipcode != null) {
          monthStat.kmByZipcode.merge(destination.zipcode, travel.distance, Double::sum);
        }
      }
    }

    // Ties are broken by route name on purpose: `travelRepository` does not sort,
    // so relying on encounter order would let Mongo decide `topRoutes` — and with
    // it `home`, which is picked from the top two routes only.
    List<TopRouteDTO> topRoutes = routeCounts.entrySet().stream()
        .sorted(Comparator.comparingInt(Map.Entry<String, Integer>::getValue).reversed()
            .thenComparing(Map.Entry::getKey))
        .limit(TOP_ROUTES_LIMIT)
        .map(entry -> new TopRouteDTO(entry.getKey(), entry.getValue()))
        .collect(Collectors.toCollection(ArrayList::new));

    String home = statsService.calculateHome(topRoutes);
    if (home != null) {
      reorderRoutesAroundHome(topRoutes, home);
    }

    return new DashboardStatsDTO(baseStats, monthlyStats, topRoutes, home);
  }

  private void reorderRoutesAroundHome(List<TopRouteDTO> topRoutes, String home) {
    for (TopRouteDTO route : topRoutes) {
      if (!route.route.contains(home)) {
        continue;
      }
      String[] endpoints = route.route.split(java.util.regex.Pattern.quote(StatsService.ROUTE_SEPARATOR));
      String other = endpoints[0].equals(home) ? endpoints[1] : endpoints[0];
      route.route = home + StatsService.ROUTE_SEPARATOR + other;
    }
  }
}
