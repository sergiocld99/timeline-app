package com.timeline.stats.service;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.MonthMap;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.domain.ZipcodeList;
import com.timeline.stats.dto.DashboardStatsDTO;
import com.timeline.stats.dto.LocatedTravelDTO;
import com.timeline.stats.dto.MonthlyPlacesDTO;
import com.timeline.stats.dto.MonthlyStatDTO;
import com.timeline.stats.dto.PlacesVisitedDTO;
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
import java.util.Set;
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

  @Inject
  RouteService routeService;

  /**
   * 1. Obtiene los viajes de userId entre dateFrom y dateTo.
   * 2. Obtiene las locations a partir de esos viajes.
   * 3. Puebla cada viaje con datos completos de origen y destino.
   * 4. Calcula zipcodes visitados, totales, días y rutas únicas.
   * 5. Calcula los km y zipcodes de cada mes.
   * 6. Calcula las rutas más frecuentes.
   */
  public DashboardStatsDTO calculateDashboardStats(Instant dateFrom, Instant dateTo, Integer userId) {
    List<Travel> travels = travelRepository.findByDateRangeAndUser(dateFrom, dateTo, userId);
    List<Location> locations = placesService.getLocationsFromTravels(travels);
    StatsContextDTO context = new StatsContextDTO(travels, locations);

    TravelStatsDTO baseStats = statsService.calculateBasicStatsFromContext(context);

    // TreeMap so the "YYYY-MM" keys come out chronologically for any consumer
    MonthMap<MonthlyStatDTO> monthlyStats = new MonthMap<>();
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
        String routeKey = sortedNames.get(0) + RouteService.ROUTE_SEPARATOR + sortedNames.get(1);
        routeCounts.merge(routeKey, 1, Integer::sum);

        monthStat.zipcodes.put(origin.zipcode);
        monthStat.zipcodes.put(destination.zipcode);

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

    String home = routeService.calculateHome(topRoutes);
    if (home != null) {
      routeService.reorderRoutesAroundHome(topRoutes, home);
    }

    return new DashboardStatsDTO(baseStats, monthlyStats, topRoutes, home);
  }

  public MonthlyPlacesDTO calculateMonthlyPlaces(Instant dateFrom, Instant dateTo, Integer userId) {
    List<Travel> travels = travelRepository.findByDateRangeAndUser(dateFrom, dateTo, userId);
    List<Location> locations = placesService.getLocationsFromTravels(travels);
    StatsContextDTO context = new StatsContextDTO(travels, locations);
    
    Set<String> zipcodes = placesService.getZipcodesFromLocations(context.locations);
    PlacesVisitedDTO placesVisited = new PlacesVisitedDTO(zipcodes, placesService.getPlaceInfoByZipcode(context));
    MonthMap<ZipcodeList> zipcodesByMonth = getZipcodesByMonth(context);

    return new MonthlyPlacesDTO(placesVisited, zipcodesByMonth);
  } 

  private MonthMap<ZipcodeList> getZipcodesByMonth(StatsContextDTO context) {
    MonthMap<ZipcodeList> zipcodesByMonth = new MonthMap<>();

    for (LocatedTravelDTO locatedTravel : context.locatedTravels) {
      Travel travel = locatedTravel.travel();
      Location origin = locatedTravel.origin();
      Location destination = locatedTravel.destination();

      travel.enrich();
      String monthKey = travel.date.substring(0, 7);
      ZipcodeList monthStat = zipcodesByMonth.computeIfAbsent(monthKey, key -> new ZipcodeList());

      if (origin != null && destination != null) {
        monthStat.put(origin.zipcode);
        monthStat.put(destination.zipcode);
      }
    }

    return zipcodesByMonth;
  }
}
