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
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

import com.timeline.stats.dto.MapConfigDTO;

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

    Set<String> uniqueDays = new HashSet<>();
    int travelCount = context.locatedTravels.size();
    Map<String, Integer> frequencyMap = new HashMap<>();
    Location mostFrequentLocation = null;
    int maxFrequency = 0;
    double totalDistance = 0.0;
    double totalMinutes = 0.0;
    double totalLatitude = 0.0;
    double totalLongitude = 0.0;

    for (LocatedTravelDTO locatedTravel : context.locatedTravels) {
      Travel travel = locatedTravel.travel();
      Location originRef = locatedTravel.origin();
      Location destRef = locatedTravel.destination();

      travel.enrich();
      totalDistance += Objects.requireNonNull(travel.distance);
      totalMinutes += Objects.requireNonNull(travel.duration);
      uniqueDays.add(travel.date);

      if (originRef != null) {
        totalLatitude += originRef.latitude * travel.duration;
        totalLongitude += originRef.longitude * travel.duration;

        int freq = frequencyMap.getOrDefault(originRef.id.toString(), 0) + 1;
        frequencyMap.put(originRef.id.toString(), freq);
        if (freq > maxFrequency) {
          maxFrequency = freq;
          mostFrequentLocation = originRef;
        }
      }

      if (destRef != null) {
        totalLatitude += destRef.latitude * travel.duration;
        totalLongitude += destRef.longitude * travel.duration;

        int freq = frequencyMap.getOrDefault(destRef.id.toString(), 0) + 1;
        frequencyMap.put(destRef.id.toString(), freq);
        if (freq > maxFrequency) {
          maxFrequency = freq;
          mostFrequentLocation = destRef;
        }
      }
    }

    TravelStatsDTO stats = new TravelStatsDTO(travelCount, totalDistance, totalMinutes, totalLatitude, totalLongitude,
        placesVisited, uniqueDays.size());

    if (mostFrequentLocation != null && stats.averageLatitude != 0) {
      stats.mapConfig = calculateMapConfig(mostFrequentLocation, stats.averageLatitude, stats.averageLongitude);
    }

    return stats;
  }

  private MapConfigDTO calculateMapConfig(Location mostFrequent, double avgLat, double avgLng) {
    double centerLat = (mostFrequent.latitude + avgLat) / 2.0;
    double centerLng = (mostFrequent.longitude + avgLng) / 2.0;

    double distanceKm = calculateDistanceKm(mostFrequent.latitude, avgLat, mostFrequent.longitude, avgLng);
    int zoom = getZoomByDistance(distanceKm);

    return new MapConfigDTO(Arrays.asList(centerLat, centerLng), zoom);
  }

  private double calculateDistanceKm(double lat1, double lat2, double lon1, double lon2) {
    final int R = 6371; // Radius of the earth
    double latDistance = Math.toRadians(lat2 - lat1);
    double lonDistance = Math.toRadians(lon2 - lon1);
    double a = Math.sin(latDistance / 2.0) * Math.sin(latDistance / 2.0)
        + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(lonDistance / 2.0) * Math.sin(lonDistance / 2.0);
    double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
    return R * c;
  }

  private int getZoomByDistance(double km) {
    if (km > 140)
      return 7;
    if (km > 100)
      return 8;
    if (km > 50)
      return 9;
    if (km > 15)
      return 10;
    if (km > 7.5)
      return 11;
    if (km > 3.25)
      return 12;
    return 13;
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
