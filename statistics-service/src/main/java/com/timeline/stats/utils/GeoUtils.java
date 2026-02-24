package com.timeline.stats.utils;

/**
 * Utility class for geographical calculations
 */
public class GeoUtils {

  /**
   * Calculates the distance between two points in kilometers using the Haversine
   * formula
   */
  public static double calculateDistanceKm(double lat1, double lat2, double lon1, double lon2) {
    final int R = 6371; // Radius of the earth in km
    double latDistance = Math.toRadians(lat2 - lat1);
    double lonDistance = Math.toRadians(lon2 - lon1);
    double a = Math.sin(latDistance / 2.0) * Math.sin(latDistance / 2.0)
        + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(lonDistance / 2.0) * Math.sin(lonDistance / 2.0);
    double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
    return R * c;
  }

  /**
   * Returns a suggested zoom level based on the distance in kilometers
   */
  public static int getZoomByDistance(double km) {
    if (km > 140)
      return 7;
    if (km > 100)
      return 8;
    if (km > 50)
      return 9;
    if (km > 15)
      return 10;
    if (km > 7.5)
      return 11;
    if (km > 3.25)
      return 12;
    return 13;
  }
}
