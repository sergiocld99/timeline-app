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
  public void testCalculateBasicStatsFromWeighted() {
    ObjectId travelId = new ObjectId();
    ObjectId originId = new ObjectId();
    ObjectId destinationId = new ObjectId();

    TravelDTO dto = new TravelDTO(travelId, originId, destinationId);

    Travel travel = new Travel();
    travel.id = travelId;
    travel.origin = originId;
    travel.destination = destinationId;
    travel.distance = 10.0;
    travel.duration = 60.0;
    travel.startTime = Instant.now();
    travel.endTime = travel.startTime.plusSeconds(3600);

    Location origin = new Location();
    origin.id = originId;
    origin.latitude = 10.0;
    origin.longitude = 20.0;
    origin.zipcode = "12345";

    Location destination = new Location();
    destination.id = destinationId;
    destination.latitude = 30.0;
    destination.longitude = 40.0;
    destination.zipcode = "67890";

    when(travelRepository.findByIds(any(List.class))).thenReturn(List.of(travel));
    when(placesService.getLocationsFromDTOs(any(List.class))).thenReturn(List.of(origin, destination));
    when(placesService.getZipcodesFromLocations(any())).thenCallRealMethod();

    TravelStatsDTO result = statsService.calculateBasicStatsFromWeighted(List.of(dto));

    assertEquals(1, result.count);
    assertEquals(10.0, result.totalDistance);
    assertEquals(60.0, result.totalMinutes);
  }

  @Test
  public void testCalculateBasicStatsByRange() {
    Travel travel = new Travel();
    travel.id = new ObjectId();
    travel.origin = new ObjectId();
    travel.destination = new ObjectId();
    travel.distance = 10.0;
    travel.duration = 60.0;
    travel.startTime = Instant.now();
    travel.endTime = travel.startTime.plusSeconds(3600);

    when(travelRepository.findByDateRangeAndUser(any(), any(), any())).thenReturn(List.of(travel));
    when(placesService.getLocationsFromTravels(any())).thenReturn(List.of());
    when(placesService.getZipcodesFromLocations(any())).thenReturn(java.util.Set.of());

    TravelStatsDTO result = statsService.calculateBasicStats(Instant.now(), Instant.now(), 1);

    assertEquals(1, result.count);
  }
}
