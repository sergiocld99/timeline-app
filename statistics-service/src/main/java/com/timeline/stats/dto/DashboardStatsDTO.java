package com.timeline.stats.dto;

import java.util.List;
import java.util.Map;

/**
 * Screen-shaped stats for the dashboard: the base travel totals plus
 * monthly breakdown, top routes and detected home location.
 */
public class DashboardStatsDTO extends TravelStatsDTO {

  public Map<String, MonthlyStatDTO> monthlyStats;
  public List<TopRouteDTO> topRoutes;
  public String home;

  public DashboardStatsDTO() {
  }

  public DashboardStatsDTO(TravelStatsDTO base, Map<String, MonthlyStatDTO> monthlyStats,
      List<TopRouteDTO> topRoutes, String home) {
    this.count = base.count;
    this.totalDistance = base.totalDistance;
    this.totalMinutes = base.totalMinutes;
    this.totalHours = base.totalHours;
    this.averageDistance = base.averageDistance;
    this.averageSpeed = base.averageSpeed;
    this.averageLatitude = base.averageLatitude;
    this.averageLongitude = base.averageLongitude;
    this.placesVisited = base.placesVisited;
    this.uniqueDays = base.uniqueDays;
    this.uniqueRoutes = base.uniqueRoutes;

    this.monthlyStats = monthlyStats;
    this.topRoutes = topRoutes;
    this.home = home;
  }
}
