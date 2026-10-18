package com.timeline.stats.dto;

import com.timeline.stats.domain.MonthMap;
import com.timeline.stats.domain.ZipcodeList;

public class MonthlyPlacesDTO {
  private PlacesVisitedDTO placesVisited;
  private MonthMap<ZipcodeList> zipcodesByMonth;

  public MonthlyPlacesDTO(PlacesVisitedDTO places, MonthMap<ZipcodeList> byMonth) {
    this.placesVisited = places;
    this.zipcodesByMonth = byMonth;
  }

  public PlacesVisitedDTO getPlacesVisited() {
    return placesVisited;
  }

  public MonthMap<ZipcodeList> getZipcodesByMonth() {
    return zipcodesByMonth;
  }
}
