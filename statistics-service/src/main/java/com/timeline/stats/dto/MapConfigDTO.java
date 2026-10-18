package com.timeline.stats.dto;

import java.util.List;

public class MapConfigDTO {
  public List<Double> center;
  public int zoom;
  public double km;

  public MapConfigDTO() {
  }

  public MapConfigDTO(List<Double> center, int zoom, double km) {
    this.center = center;
    this.zoom = zoom;
    this.km = km;
  }
}
