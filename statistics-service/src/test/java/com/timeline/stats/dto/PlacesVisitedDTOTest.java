package com.timeline.stats.dto;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;

import com.timeline.stats.domain.Location;

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
  public void testDataMapsZipcodeToNameAndId() {
    Location location = new Location();
    location.id = new ObjectId();
    location.name = "Casa";
    location.zipcode = "B1888";

    PlacesVisitedDTO dto = new PlacesVisitedDTO(Set.of("B1888"), List.of(location));

    assertEquals("Casa", dto.data.get("B1888").name());
    assertEquals(location.id.toString(), dto.data.get("B1888").id());
  }
}
