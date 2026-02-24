package com.timeline.stats.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class GeoUtilsTest {

  @Test
  public void testCalculateDistanceKm() {
    // Distance between Buenos Aires (-34.6037, -58.3816) and La Plata (-34.9214,
    // -57.9545)
    // is approximately 52 km.
    double lat1 = -34.6037;
    double lon1 = -58.3816;
    double lat2 = -34.9214;
    double lon2 = -57.9545;

    double distance = GeoUtils.calculateDistanceKm(lat1, lat2, lon1, lon2);

    // We expect around 52.6 km. Delta of 0.5 because Haversine is an approximation
    // and depends on the exact R used.
    assertEquals(52.6, distance, 0.5);
  }

  @Test
  public void testCalculateDistanceZero() {
    double lat = -34.6037;
    double lon = -58.3816;
    double distance = GeoUtils.calculateDistanceKm(lat, lat, lon, lon);
    assertEquals(0.0, distance, 0.001);
  }

  @Test
  public void testGetZoomByDistance() {
    assertEquals(7, GeoUtils.getZoomByDistance(150));
    assertEquals(8, GeoUtils.getZoomByDistance(120));
    assertEquals(9, GeoUtils.getZoomByDistance(60));
    assertEquals(10, GeoUtils.getZoomByDistance(20));
    assertEquals(11, GeoUtils.getZoomByDistance(10));
    assertEquals(12, GeoUtils.getZoomByDistance(5));
    assertEquals(13, GeoUtils.getZoomByDistance(1));
  }
}
