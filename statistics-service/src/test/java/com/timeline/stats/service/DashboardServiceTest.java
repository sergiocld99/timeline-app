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
import com.timeline.stats.dto.DashboardStatsDTO;
import com.timeline.stats.repository.TravelRepository;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;

@QuarkusTest
public class DashboardServiceTest {

  @Inject
  DashboardService dashboardService;

  @InjectMock
  TravelRepository travelRepository;

  @InjectMock
  PlacesService placesService;

  @Test
  public void testMonthlyStatsAndTopRoutesAndHome() {
    Location casa = aLocation().named("Casa").at("B1000").build();
    Location trabajo = aLocation().named("Trabajo").at("B2000").build();
    Location gimnasio = aLocation().named("Gimnasio").at("B3000").build();

    Instant january = Instant.parse("2026-01-15T12:00:00Z");
    Instant february = Instant.parse("2026-02-10T12:00:00Z");

    List<Travel> travels = List.of(
        aTravel().from(casa).to(trabajo).startingAt(january).km(10.0).build(),
        aTravel().from(casa).to(trabajo).startingAt(january).km(10.0).build(),
        aTravel().from(casa).to(gimnasio).startingAt(february).km(5.0).build());

    when(travelRepository.findByDateRangeAndUser(any(), any(), any())).thenReturn(travels);
    when(placesService.getLocationsFromTravels(any())).thenReturn(List.of(casa, trabajo, gimnasio));
    when(placesService.getZipcodesFromLocations(any())).thenCallRealMethod();
    when(placesService.getPlaceInfoByZipcode(any())).thenCallRealMethod();

    DashboardStatsDTO result = dashboardService.calculateDashboardStats(january, february.plusSeconds(3600), 1);

    assertEquals(3, result.count);
    assertEquals(2, result.monthlyStats.size());
    assertEquals(20.0, result.monthlyStats.get("2026-01").km, 0.001);
    assertEquals(2, result.monthlyStats.get("2026-01").count);
    assertEquals(20.0, result.monthlyStats.get("2026-01").kmByZipcode.get("B2000"), 0.001);
    assertEquals(5.0, result.monthlyStats.get("2026-02").km, 0.001);

    assertEquals("Casa", result.home);
    assertEquals("Casa ↔ Trabajo", result.topRoutes.get(0).route);
    assertEquals(2, result.topRoutes.get(0).count);
    assertEquals("Casa ↔ Gimnasio", result.topRoutes.get(1).route);
  }

  @Test
  public void testTiedRoutesAreOrderedByNameRegardlessOfTravelOrder() {
    Location casa = aLocation().named("Casa").at("B1000").build();
    Location trabajo = aLocation().named("Trabajo").at("B2000").build();
    Location gimnasio = aLocation().named("Gimnasio").at("B3000").build();

    Instant january = Instant.parse("2026-01-15T12:00:00Z");

    // Both routes end up with one travel each; the repository does not sort, so
    // the tie must not be decided by whichever travel Mongo happened to return first
    List<Travel> travels = List.of(
        aTravel().from(casa).to(trabajo).startingAt(january).km(10.0).build(),
        aTravel().from(casa).to(gimnasio).startingAt(january).km(5.0).build());
    List<Travel> reversed = List.of(travels.get(1), travels.get(0));

    when(placesService.getLocationsFromTravels(any())).thenReturn(List.of(casa, trabajo, gimnasio));
    when(placesService.getZipcodesFromLocations(any())).thenCallRealMethod();
    when(placesService.getPlaceInfoByZipcode(any())).thenCallRealMethod();

    when(travelRepository.findByDateRangeAndUser(any(), any(), any())).thenReturn(travels);
    DashboardStatsDTO result = dashboardService.calculateDashboardStats(january, january, 1);

    when(travelRepository.findByDateRangeAndUser(any(), any(), any())).thenReturn(reversed);
    DashboardStatsDTO reversedResult = dashboardService.calculateDashboardStats(january, january, 1);

    assertEquals("Casa ↔ Gimnasio", result.topRoutes.get(0).route);
    assertEquals(result.topRoutes.get(0).route, reversedResult.topRoutes.get(0).route);
    assertEquals(result.home, reversedResult.home);
  }
}
