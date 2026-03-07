package com.timeline.stats.dto;

/**
 * DTO to encapsulate total statistics values
 */
public class StatsTotalsDTO {
  public double totalDistance = 0.0;
  public double totalMinutes = 0.0;
  public double totalLatitude = 0.0;
  public double totalLongitude = 0.0;

  public void addDistance(double distance) {
    this.totalDistance += distance;
  }

  public void addMinutes(double minutes) {
    this.totalMinutes += minutes;
  }

  public void addCoordinateAccumulation(double lat, double lng, double duration) {
    this.totalLatitude += lat * duration;
    this.totalLongitude += lng * duration;
  }
}
