package com.timeline.stats.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.bson.types.ObjectId;
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

  private Location location(String name, String zipcode) {
    Location location = new Location();
    location.id = new ObjectId();
    location.name = name;
    location.zipcode = zipcode;
    location.latitude = 0;
    location.longitude = 0;
    return location;
  }

  private Travel travel(Location origin, Location destination, Instant startTime, double distance) {
    Travel travel = new Travel();
    travel.id = new ObjectId();
    travel.origin = origin.id;
    travel.destination = destination.id;
    travel.distance = distance;
    travel.startTime = startTime;
    travel.endTime = startTime.plusSeconds(3600);
    return travel;
  }

  @Test
  public void testMonthlyStatsAndTopRoutesAndHome() {
    Location casa = location("Casa", "B1000");
    Location trabajo = location("Trabajo", "B2000");
    Location gimnasio = location("Gimnasio", "B3000");

    Instant january = Instant.parse("2026-01-15T12:00:00Z");
    Instant february = Instant.parse("2026-02-10T12:00:00Z");

    List<Travel> travels = List.of(
        travel(casa, trabajo, january, 10.0),
        travel(casa, trabajo, january, 10.0),
        travel(casa, gimnasio, february, 5.0));

    when(travelRepository.findByDateRangeAndUser(any(), any(), any())).thenReturn(travels);
    when(placesService.getLocationsFromTravels(any())).thenReturn(List.of(casa, trabajo, gimnasio));
    when(placesService.getZipcodesFromLocations(any())).thenCallRealMethod();

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
}
