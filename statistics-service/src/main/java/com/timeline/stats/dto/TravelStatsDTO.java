package com.timeline.stats.dto;

/**
 * Simple DTO for basic travel statistics
 */
public class TravelStatsDTO {

  public long count;
  public double totalDistance;
  public double totalMinutes;
  public double totalHours;
  public double averageDistance;
  public double averageSpeed;
  public double averageLatitude;
  public double averageLongitude;
  public PlacesVisitedDTO placesVisited;
  public long uniqueDays;
  public long uniqueRoutes;

  public TravelStatsDTO() {
  }

  public TravelStatsDTO(long count, StatsTotalsDTO totals, PlacesVisitedDTO placesVisited, long uniqueDays,
      long uniqueRoutes) {
    this(count, totals.totalDistance, totals.totalMinutes, totals.totalLatitude, totals.totalLongitude, placesVisited,
        uniqueDays, uniqueRoutes);
  }

  public TravelStatsDTO(long count, double totalDistance, double totalMinutes, double totalLatitude,
      double totalLongitude, PlacesVisitedDTO placesVisited, long uniqueDays, long uniqueRoutes) {
    this.count = count;
    this.totalDistance = Math.round(totalDistance * 100.0) / 100.0;
    this.totalMinutes = Math.round(totalMinutes * 100.0) / 100.0;
    this.totalHours = totalMinutes / 60.0;
    this.placesVisited = placesVisited;
    this.uniqueDays = uniqueDays;
    this.uniqueRoutes = uniqueRoutes;

    if (count > 0) {
      this.averageDistance = Math.round((totalDistance / count) * 100.0) / 100.0;
      this.averageLatitude = totalLatitude / (totalMinutes * 2);
      this.averageLongitude = totalLongitude / (totalMinutes * 2);
    }

    if (totalHours > 0) {
      this.averageSpeed = Math.round((totalDistance / totalHours) * 100.0) / 100.0;
    }
  }
}
