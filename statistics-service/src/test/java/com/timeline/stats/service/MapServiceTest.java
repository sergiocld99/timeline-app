package com.timeline.stats.service;

import static com.timeline.stats.TestFixtures.aLocation;
import static com.timeline.stats.TestFixtures.aTravel;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

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
    Location origin = aLocation().coordinates(10.0, 20.0).at("12345").build();
    Location destination = aLocation().coordinates(30.0, 40.0).at("67890").build();

    Travel travel = aTravel().from(origin).to(destination).startingAt(Instant.now()).km(10.0).build();
    TravelDTO dto = new TravelDTO(travel.id, origin.id, destination.id);

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
