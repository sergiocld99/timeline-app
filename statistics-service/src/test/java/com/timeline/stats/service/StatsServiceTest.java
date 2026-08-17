package com.timeline.stats.service;

import static com.timeline.stats.TestFixtures.aLocation;
import static com.timeline.stats.TestFixtures.aTravel;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.dto.TravelDTO;
import com.timeline.stats.dto.TravelStatsDTO;
import com.timeline.stats.repository.TravelRepository;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;

@QuarkusTest
public class StatsServiceTest {

  @Inject
  StatsService statsService;

  @InjectMock
  TravelRepository travelRepository;

  @InjectMock
  PlacesService placesService;

  @Test
  @SuppressWarnings("unchecked")
  public void testCalculateBasicStatsFromWeighted() {
    Location origin = aLocation().coordinates(10.0, 20.0).at("12345").build();
    Location destination = aLocation().coordinates(30.0, 40.0).at("67890").build();

    Travel travel = aTravel().from(origin).to(destination).startingAt(Instant.now()).km(10.0).build();
    TravelDTO dto = new TravelDTO(travel.id, origin.id, destination.id);

    when(travelRepository.findByIds(any(List.class))).thenReturn(List.of(travel));
    when(placesService.getLocationsFromDTOs(any(List.class))).thenReturn(List.of(origin, destination));
    when(placesService.getZipcodesFromLocations(any())).thenCallRealMethod();
    when(placesService.getPlaceInfoByZipcode(any())).thenCallRealMethod();

    TravelStatsDTO result = statsService.calculateBasicStatsFromIds(List.of(dto));

    // Assertions básicas (SDD - Validando lógica ponderada por tiempo)
    assertEquals(1, result.count);
    assertEquals(10.0, result.totalDistance);
    assertEquals(60.0, result.totalMinutes);
    assertEquals(20.0, result.averageLatitude, 0.001); // ( (10*60)+(30*60) ) / (60*2) = 20
    assertEquals(30.0, result.averageLongitude, 0.001); // ( (20*60)+(40*60) ) / (60*2) = 30
  }

  @Test
  public void testCalculateBasicStatsByRange() {
    Travel travel = aTravel().startingAt(Instant.now()).km(10.0).build();

    when(travelRepository.findByDateRangeAndUser(any(), any(), any())).thenReturn(List.of(travel));
    when(placesService.getLocationsFromTravels(any())).thenReturn(List.of());
    when(placesService.getZipcodesFromLocations(any())).thenReturn(java.util.Set.of());

    TravelStatsDTO result = statsService.calculateBasicStats(Instant.now(), Instant.now(), 1);

    assertEquals(1, result.count);
  }
}
