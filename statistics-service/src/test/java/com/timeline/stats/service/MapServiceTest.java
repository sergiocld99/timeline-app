package com.timeline.stats.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;
import com.timeline.stats.dto.MapConfigDTO;
import com.timeline.stats.dto.TravelDTO;
import com.timeline.stats.repository.TravelRepository;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;

@QuarkusTest
public class MapServiceTest {

  @Inject
  MapService mapService;

  @InjectMock
  TravelRepository travelRepository;

  @InjectMock
  PlacesService placesService;

  @Test
  @SuppressWarnings("unchecked")
  public void testCalculateMapConfig() {
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

    MapConfigDTO result = mapService.calculateMapConfigFromIds(List.of(dto));

    assertNotNull(result, "mapConfig should not be null");

    // Centro = Midpoint entre el más frecuente (10,20) y el más lejano (30,40)
    assertEquals(20.0, result.center.get(0), 0.001);
    assertEquals(30.0, result.center.get(1), 0.001);

    // Zoom para la distancia calculada (> 140km)
    assertEquals(7, result.zoom);
  }
}
