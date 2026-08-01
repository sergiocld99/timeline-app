package com.timeline.stats.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Set;

public class PlacesVisitedDTO {
  public int count;
  public String[] zipcodes;
  public Map<String, PlaceInfoDTO> data;

  public PlacesVisitedDTO() {
  }

  public PlacesVisitedDTO(Set<String> zipcodes) {
    this.count = zipcodes.size();
    this.zipcodes = zipcodes.toArray(new String[0]);
    Arrays.sort(this.zipcodes);
  }

  public PlacesVisitedDTO(Set<String> zipcodes, Map<String, PlaceInfoDTO> data) {
    this(zipcodes);
    this.data = data;
  }
}
