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
    Location mostFrequentLocation = findMostFrequentLocation(context.locatedTravels);

    if (mostFrequentLocation == null) {
      return null;
    }

    Location mostDistantLocation = findMostDistantLocation(mostFrequentLocation, context.locations);

    return calculateMapConfig(mostFrequentLocation, mostDistantLocation);
  }

  private Location findMostFrequentLocation(List<LocatedTravelDTO> locatedTravels) {
    Map<String, Integer> frequencyMap = new HashMap<>();
    Location mostFrequent = null;
    int maxFrequency = 0;

    for (LocatedTravelDTO locatedTravel : locatedTravels) {
      Location originRef = locatedTravel.origin();
      Location destRef = locatedTravel.destination();

      if (originRef != null) {
        int freq = frequencyMap.getOrDefault(originRef.id.toString(), 0) + 1;
        frequencyMap.put(originRef.id.toString(), freq);
        if (freq > maxFrequency) {
          maxFrequency = freq;
          mostFrequent = originRef;
        }
      }

      if (destRef != null) {
        int freq = frequencyMap.getOrDefault(destRef.id.toString(), 0) + 1;
        frequencyMap.put(destRef.id.toString(), freq);
        if (freq > maxFrequency) {
          maxFrequency = freq;
          mostFrequent = destRef;
        }
      }
    }
    return mostFrequent;
  }

  private Location findMostDistantLocation(Location reference, List<Location> locations) {
    Location mostDistant = reference;
    double maxDistance = 0;

    for (Location loc : locations) {
      double dist = GeoUtils.calculateDistanceKm(
          reference.latitude, loc.latitude,
          reference.longitude, loc.longitude);
      
      if (dist > maxDistance) {
        maxDistance = dist;
        mostDistant = loc;
      }
    }
    return mostDistant;
  }

  private MapConfigDTO calculateMapConfig(Location pointA, Location pointB) {
    double centerLat = (pointA.latitude + pointB.latitude) / 2.0;
    double centerLng = (pointA.longitude + pointB.longitude) / 2.0;

    double distanceKm = GeoUtils.calculateDistanceKm(pointA.latitude, pointB.latitude, pointA.longitude, pointB.longitude);
    int zoom = GeoUtils.getZoomByDistance(distanceKm);

    return new MapConfigDTO(Arrays.asList(centerLat, centerLng), zoom);
  }
}
