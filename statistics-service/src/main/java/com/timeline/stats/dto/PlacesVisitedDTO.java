package com.timeline.stats.dto;

import com.timeline.stats.domain.Location;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
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

  public PlacesVisitedDTO(Set<String> zipcodes, List<Location> locations) {
    this(zipcodes);

    this.data = new HashMap<>();
    for (Location location : locations) {
      if (location.zipcode != null) {
        this.data.put(location.zipcode, new PlaceInfoDTO(location.name, location.id.toString()));
      }
    }
  }
}
