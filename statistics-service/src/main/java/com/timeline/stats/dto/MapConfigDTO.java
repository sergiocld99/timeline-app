package com.timeline.stats.dto;

import java.util.List;

public class MapConfigDTO {
  public List<Double> center;
  public int zoom;

  public MapConfigDTO() {
  }

  public MapConfigDTO(List<Double> center, int zoom) {
    this.center = center;
    this.zoom = zoom;
  }
}
