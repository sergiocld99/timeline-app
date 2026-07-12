package com.timeline.stats.dto;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;

import java.util.LinkedHashSet;
import java.util.Set;

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
  }
}
