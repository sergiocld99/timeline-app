package com.timeline.stats.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.dto.LocatedTravelDTO;
import com.timeline.stats.dto.PlaceInfoDTO;
import com.timeline.stats.dto.StatsContextDTO;
import com.timeline.stats.dto.TravelDTO;
import com.timeline.stats.repository.LocationRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class PlacesService {
  @Inject
  LocationRepository locationRepository;

  public List<Location> getLocationFromIds(Set<ObjectId> ids) {
    return ids.isEmpty() ? List.of() : locationRepository.findByIds(ids);
  }

  public List<Location> getLocationsFromDTOs(List<TravelDTO> dtos) {
    Set<ObjectId> locationIds = new HashSet<>();

    dtos.forEach((TravelDTO dto) -> {
      locationIds.add(dto.origin());
      locationIds.add(dto.destination());
    });

    return getLocationFromIds(locationIds);
  }

  public List<Location> getLocationsFromTravels(List<Travel> travels) {
    Set<ObjectId> locationIds = new HashSet<>();

    travels.forEach((Travel travel) -> {
      locationIds.add(travel.origin);
      locationIds.add(travel.destination);
    });

    return getLocationFromIds(locationIds);
  }

  public Set<String> getZipcodesFromLocations(List<Location> locations) {
    return locations.stream().map(loc -> loc.zipcode).collect(Collectors.toSet());
  }

  public Set<String> getZipcodesFromTravels(List<TravelDTO> travels) {
    return getZipcodesFromLocations(getLocationsFromDTOs(travels));
  }

  /**
   * Picks the place shown for each zipcode. Several locations can share one
   * (zipcode is not unique), so the most visited location wins — ties go to the
   * oldest one. Order of `context.locations` is whatever Mongo returned, so it
   * must not decide the name.
   */
  public Map<String, PlaceInfoDTO> getPlaceInfoByZipcode(StatsContextDTO context) {
    Map<ObjectId, Integer> visitsByLocation = new HashMap<>();

    for (LocatedTravelDTO locatedTravel : context.locatedTravels) {
      countVisit(visitsByLocation, locatedTravel.origin());
      countVisit(visitsByLocation, locatedTravel.destination());
    }

    Map<String, Location> bestByZipcode = new HashMap<>();

    for (Location location : context.locations) {
      if (location.zipcode == null) {
        continue;
      }

      Location current = bestByZipcode.get(location.zipcode);
      if (current == null || isBetterPlace(location, current, visitsByLocation)) {
        bestByZipcode.put(location.zipcode, location);
      }
    }

    Map<String, PlaceInfoDTO> data = new HashMap<>();
    bestByZipcode.forEach((zipcode, location) -> data.put(zipcode,
        new PlaceInfoDTO(location.name, location.id.toString())));

    return data;
  }

  private void countVisit(Map<ObjectId, Integer> visitsByLocation, Location location) {
    if (location != null) {
      visitsByLocation.merge(location.id, 1, Integer::sum);
    }
  }

  private boolean isBetterPlace(Location candidate, Location current, Map<ObjectId, Integer> visitsByLocation) {
    int candidateVisits = visitsByLocation.getOrDefault(candidate.id, 0);
    int currentVisits = visitsByLocation.getOrDefault(current.id, 0);

    if (candidateVisits != currentVisits) {
      return candidateVisits > currentVisits;
    }

    // ObjectId embeds its creation timestamp, so the lowest one is the oldest place
    return candidate.id.compareTo(current.id) < 0;
  }
}
