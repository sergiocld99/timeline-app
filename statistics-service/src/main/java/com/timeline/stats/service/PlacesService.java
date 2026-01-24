package com.timeline.stats.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
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
}
