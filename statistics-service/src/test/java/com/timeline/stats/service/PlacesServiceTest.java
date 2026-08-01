package com.timeline.stats.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.dto.PlaceInfoDTO;
import com.timeline.stats.dto.StatsContextDTO;
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

  private Location locationAt(String hexId, String name, String zipcode) {
    Location location = new Location();
    location.id = new ObjectId(hexId);
    location.name = name;
    location.zipcode = zipcode;
    return location;
  }

  private Travel travelBetween(Location origin, Location destination) {
    Travel travel = new Travel();
    travel.id = new ObjectId();
    travel.origin = origin.id;
    travel.destination = destination.id;
    return travel;
  }

  @Test
  public void testGetZipcodesWhenNoTravels() {
    Set<String> result = placesService.getZipcodesFromTravels(List.of());
    assertEquals(0, result.size());
  }

  @Test
  @SuppressWarnings("unchecked")
  public void testGetZipcodesFromTravels() {
    Location loc1 = new Location();
    loc1.id = new ObjectId();
    loc1.zipcode = "B1859";

    Location loc2 = new Location();
    loc2.id = new ObjectId();
    loc2.zipcode = "B1888";

    Location loc3 = new Location();
    loc3.id = new ObjectId();
    loc3.zipcode = "B1888";

    TravelDTO dto1 = new TravelDTO(new ObjectId(), loc1.id, loc2.id);
    TravelDTO dto2 = new TravelDTO(new ObjectId(), loc2.id, loc3.id);
    TravelDTO dto3 = new TravelDTO(new ObjectId(), loc3.id, loc1.id);

    when(locationRepository.findByIds(any(Set.class))).thenReturn(List.of(loc1, loc2, loc3));

    Set<String> result = placesService.getZipcodesFromTravels(List.of(dto1, dto2, dto3));

    assertEquals(2, result.size());
    assertTrue(result.contains("B1859"));
    assertTrue(result.contains("B1888"));
  }

  @Test
  @SuppressWarnings("unchecked")
  public void testGetLocationsFromDTOs() {
    Location loc1 = new Location();
    loc1.id = new ObjectId();
    Location loc2 = new Location();
    loc2.id = new ObjectId();

    TravelDTO dto1 = new TravelDTO(new ObjectId(), loc1.id, loc2.id);
    TravelDTO dto2 = new TravelDTO(new ObjectId(), loc2.id, loc1.id);

    when(locationRepository.findByIds(any(Set.class))).thenReturn(List.of(loc1, loc2));

    List<Location> result = placesService.getLocationsFromDTOs(List.of(dto1, dto2));

    assertEquals(2, result.size());
    assertTrue(result.contains(loc1));
    assertTrue(result.contains(loc2));
  }

  @Test
  @SuppressWarnings("unchecked")
  public void testGetLocationsFromTravels() {
    Location loc1 = new Location();
    loc1.id = new ObjectId();
    Location loc2 = new Location();
    loc2.id = new ObjectId();

    Travel travel1 = new Travel();
    travel1.origin = loc1.id;
    travel1.destination = loc2.id;

    Travel travel2 = new Travel();
    travel2.origin = loc2.id;
    travel2.destination = loc1.id;

    when(locationRepository.findByIds(any(Set.class))).thenReturn(List.of(loc1, loc2));

    List<Location> result = placesService.getLocationsFromTravels(List.of(travel1, travel2));

    assertEquals(2, result.size());
    assertTrue(result.contains(loc1));
    assertTrue(result.contains(loc2));
  }

  @Test
  public void testPlaceInfoPicksTheMostVisitedLocationOfEachZipcode() {
    Location home = locationAt("000000000000000000000001", "Casa", "B1000");
    Location frequent = locationAt("000000000000000000000002", "Quilmes Centro", "B1878");
    Location oneOff = locationAt("000000000000000000000003", "Parada casual", "B1878");

    // `oneOff` is last in the location list, so a naive "last one wins" would pick it
    StatsContextDTO context = new StatsContextDTO(
        List.of(travelBetween(home, frequent), travelBetween(home, frequent), travelBetween(home, oneOff)),
        List.of(home, frequent, oneOff));

    Map<String, PlaceInfoDTO> result = placesService.getPlaceInfoByZipcode(context);

    assertEquals("Quilmes Centro", result.get("B1878").name());
    assertEquals(frequent.id.toString(), result.get("B1878").id());
    assertEquals("Casa", result.get("B1000").name());
  }

  @Test
  public void testPlaceInfoBreaksTiesWithTheOldestLocation() {
    Location home = locationAt("000000000000000000000001", "Casa", "B1000");
    Location older = locationAt("000000000000000000000002", "Plaza vieja", "B1878");
    Location newer = locationAt("000000000000000000000003", "Plaza nueva", "B1878");

    StatsContextDTO context = new StatsContextDTO(
        List.of(travelBetween(home, older), travelBetween(home, newer)),
        List.of(newer, older));

    Map<String, PlaceInfoDTO> result = placesService.getPlaceInfoByZipcode(context);

    assertEquals("Plaza vieja", result.get("B1878").name());
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
