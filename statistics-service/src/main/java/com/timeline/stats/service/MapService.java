package com.timeline.stats.service;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.dto.LocatedTravelDTO;
import com.timeline.stats.dto.MapConfigDTO;
import com.timeline.stats.dto.StatsContextDTO;
import com.timeline.stats.dto.TravelDTO;
import com.timeline.stats.repository.TravelRepository;
import com.timeline.stats.utils.GeoUtils;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Service for calculating map configuration and spatial data
 */
@ApplicationScoped
public class MapService {

  @Inject
  TravelRepository travelRepository;

  @Inject
  PlacesService placesService;

  public MapConfigDTO calculateMapConfigFromIds(List<TravelDTO> dtos) {
    if (dtos == null || dtos.isEmpty()) {
      return null;
    }

    CompletableFuture<List<Travel>> travelsFuture = CompletableFuture
        .supplyAsync(() -> travelRepository.findByIds(dtos.stream().map(t -> t.id()).toList()));

    CompletableFuture<List<Location>> locationsFuture = CompletableFuture
        .supplyAsync(() -> placesService.getLocationsFromDTOs(dtos));

    List<Travel> travels = travelsFuture.join();
    List<Location> locations = locationsFuture.join();

    StatsContextDTO context = new StatsContextDTO(travels, locations);
    return calculateMapConfigFromContext(context);
  }

  public MapConfigDTO calculateMapConfigFromContext(StatsContextDTO context) {
    Map<String, Integer> frequencyMap = new HashMap<>();
    Location mostFrequentLocation = null;
    int maxFrequency = 0;

    double totalLatitude = 0;
    double totalLongitude = 0;
    double totalMinutes = 0;

    for (LocatedTravelDTO locatedTravel : context.locatedTravels) {
      Travel travel = locatedTravel.travel();
      Location originRef = locatedTravel.origin();
      Location destRef = locatedTravel.destination();

      travel.enrich();
      double duration = travel.duration != null ? travel.duration : 0;
      totalMinutes += duration;

      if (originRef != null) {
        totalLatitude += originRef.latitude * duration;
        totalLongitude += originRef.longitude * duration;

        int freq = frequencyMap.getOrDefault(originRef.id.toString(), 0) + 1;
        frequencyMap.put(originRef.id.toString(), freq);
        if (freq > maxFrequency) {
          maxFrequency = freq;
          mostFrequentLocation = originRef;
        }
      }

      if (destRef != null) {
        totalLatitude += destRef.latitude * duration;
        totalLongitude += destRef.longitude * duration;

        int freq = frequencyMap.getOrDefault(destRef.id.toString(), 0) + 1;
        frequencyMap.put(destRef.id.toString(), freq);
        if (freq > maxFrequency) {
          maxFrequency = freq;
          mostFrequentLocation = destRef;
        }
      }
    }

    if (mostFrequentLocation != null && totalMinutes > 0) {
      double averageLatitude = totalLatitude / (totalMinutes * 2);
      double averageLongitude = totalLongitude / (totalMinutes * 2);
      return calculateMapConfig(mostFrequentLocation, averageLatitude, averageLongitude);
    }

    return null;
  }

  private MapConfigDTO calculateMapConfig(Location mostFrequent, double avgLat, double avgLng) {
    double centerLat = (mostFrequent.latitude + avgLat) / 2.0;
    double centerLng = (mostFrequent.longitude + avgLng) / 2.0;

    double distanceKm = GeoUtils.calculateDistanceKm(mostFrequent.latitude, avgLat, mostFrequent.longitude, avgLng);
    int zoom = GeoUtils.getZoomByDistance(distanceKm);

    return new MapConfigDTO(Arrays.asList(centerLat, centerLng), zoom);
  }
}
