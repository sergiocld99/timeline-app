package com.timeline.stats.dto;

public class TopRouteDTO {
  public String route;
  public int count;

  public TopRouteDTO() {
  }

  public TopRouteDTO(String route, int count) {
    this.route = route;
    this.count = count;
  }
}
