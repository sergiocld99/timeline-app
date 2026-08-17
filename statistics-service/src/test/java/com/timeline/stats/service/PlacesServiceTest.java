package com.timeline.stats.service;

import static com.timeline.stats.TestFixtures.aLocation;
import static com.timeline.stats.TestFixtures.aTravel;
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

  @Test
  public void testGetZipcodesWhenNoTravels() {
    Set<String> result = placesService.getZipcodesFromTravels(List.of());
    assertEquals(0, result.size());
  }

  @Test
  @SuppressWarnings("unchecked")
  public void testGetZipcodesFromTravels() {
    Location loc1 = aLocation().at("B1859").build();
    Location loc2 = aLocation().at("B1888").build();
    Location loc3 = aLocation().at("B1888").build();

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
    Location loc1 = aLocation().build();
    Location loc2 = aLocation().build();

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
    Location loc1 = aLocation().build();
    Location loc2 = aLocation().build();

    Travel travel1 = aTravel().from(loc1).to(loc2).build();
    Travel travel2 = aTravel().from(loc2).to(loc1).build();

    when(locationRepository.findByIds(any(Set.class))).thenReturn(List.of(loc1, loc2));

    List<Location> result = placesService.getLocationsFromTravels(List.of(travel1, travel2));

    assertEquals(2, result.size());
    assertTrue(result.contains(loc1));
    assertTrue(result.contains(loc2));
  }

  @Test
  public void testPlaceInfoPicksTheMostVisitedLocationOfEachZipcode() {
    Location home = aLocation().withId("000000000000000000000001").named("Casa").at("B1000").build();
    Location frequent = aLocation().withId("000000000000000000000002").named("Quilmes Centro").at("B1878").build();
    Location oneOff = aLocation().withId("000000000000000000000003").named("Parada casual").at("B1878").build();

    // `oneOff` is last in the location list, so a naive "last one wins" would pick it
    StatsContextDTO context = new StatsContextDTO(
        List.of(
            aTravel().from(home).to(frequent).build(),
            aTravel().from(home).to(frequent).build(),
            aTravel().from(home).to(oneOff).build()),
        List.of(home, frequent, oneOff));

    Map<String, PlaceInfoDTO> result = placesService.getPlaceInfoByZipcode(context);

    assertEquals("Quilmes Centro", result.get("B1878").name());
    assertEquals(frequent.id.toString(), result.get("B1878").id());
    assertEquals("Casa", result.get("B1000").name());
  }

  @Test
  public void testPlaceInfoBreaksTiesWithTheOldestLocation() {
    Location home = aLocation().withId("000000000000000000000001").named("Casa").at("B1000").build();
    Location older = aLocation().withId("000000000000000000000002").named("Plaza vieja").at("B1878").build();
    Location newer = aLocation().withId("000000000000000000000003").named("Plaza nueva").at("B1878").build();

    StatsContextDTO context = new StatsContextDTO(
        List.of(aTravel().from(home).to(older).build(), aTravel().from(home).to(newer).build()),
        List.of(newer, older));

    Map<String, PlaceInfoDTO> result = placesService.getPlaceInfoByZipcode(context);

    assertEquals("Plaza vieja", result.get("B1878").name());
  }

  @Test
  public void testGetZipcodesFromLocations() {
    Location loc1 = aLocation().at("12345").build();
    Location loc2 = aLocation().at("67890").build();

    Set<String> result = placesService.getZipcodesFromLocations(List.of(loc1, loc2));

    assertEquals(2, result.size());
    assertTrue(result.contains("12345"));
    assertTrue(result.contains("67890"));
  }
}
