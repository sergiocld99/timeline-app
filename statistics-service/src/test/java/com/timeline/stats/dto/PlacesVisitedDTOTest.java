package com.timeline.stats.dto;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;

public class PlacesVisitedDTOTest {

  @Test
  public void testZipcodesAreSortedAscending() {
    Set<String> zipcodes = new LinkedHashSet<>();
    zipcodes.add("C1425");
    zipcodes.add("B1888");
    zipcodes.add("B1900");

    PlacesVisitedDTO dto = new PlacesVisitedDTO(zipcodes);

    assertArrayEquals(new String[] { "B1888", "B1900", "C1425" }, dto.zipcodes);
    assertNull(dto.data);
  }

  @Test
  public void testDataIsExposedAsGiven() {
    Map<String, PlaceInfoDTO> data = Map.of("B1888", new PlaceInfoDTO("Casa", new ObjectId().toString()));

    PlacesVisitedDTO dto = new PlacesVisitedDTO(Set.of("B1888"), data);

    assertEquals("Casa", dto.data.get("B1888").name());
  }
}
