package com.timeline.stats.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.dto.TravelDTO;
import com.timeline.stats.repository.LocationRepository;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;

@QuarkusTest
public class PlacesServiceTest {

  @Inject
  PlacesService placesService;

  @InjectMock
  LocationRepository locationRepository;

  @Test
  @SuppressWarnings("unchecked")
  public void testGetLocationsFromDTOs() {
    ObjectId originId = new ObjectId();
    ObjectId destinationId = new ObjectId();
    TravelDTO dto = new TravelDTO(new ObjectId(), originId, destinationId);

    Location loc1 = new Location();
    loc1.id = originId;
    Location loc2 = new Location();
    loc2.id = destinationId;

    when(locationRepository.findByIds(any(Set.class))).thenReturn(List.of(loc1, loc2));

    List<Location> result = placesService.getLocationsFromDTOs(List.of(dto));

    assertEquals(2, result.size());
  }

  @Test
  @SuppressWarnings("unchecked")
  public void testGetLocationsFromTravels() {
    ObjectId originId = new ObjectId();
    ObjectId destinationId = new ObjectId();
    Travel travel = new Travel();
    travel.origin = originId;
    travel.destination = destinationId;

    Location loc1 = new Location();
    loc1.id = originId;
    Location loc2 = new Location();
    loc2.id = destinationId;

    when(locationRepository.findByIds(any(Set.class))).thenReturn(List.of(loc1, loc2));

    List<Location> result = placesService.getLocationsFromTravels(List.of(travel));

    assertEquals(2, result.size());
  }

  @Test
  public void testGetZipcodesFromLocations() {
    Location loc1 = new Location();
    loc1.zipcode = "12345";
    Location loc2 = new Location();
    loc2.zipcode = "67890";

    Set<String> result = placesService.getZipcodesFromLocations(List.of(loc1, loc2));

    assertEquals(2, result.size());
    assertTrue(result.contains("12345"));
    assertTrue(result.contains("67890"));
  }
}
