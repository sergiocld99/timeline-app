package com.timeline.stats.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Instant;

import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
public class TravelTest {

  @Test
  public void testCalculateDuration() {
    Travel travel = new Travel();
    travel.startTime = Instant.now().minusSeconds(600);
    travel.endTime = Instant.now();

    // 600 seconds = 10 minutes
    assertEquals(10, travel.calculateDuration());
    assertEquals(10, travel.duration);
  }

  @Test
  public void testCalculateDurationWhenNullStartTime() {
    Travel travel = new Travel();
    travel.endTime = Instant.now();

    assertEquals(0, travel.calculateDuration());
    assertEquals(0, travel.duration);
  }

  @Test
  public void testCalculateDurationWhenNullEndTime() {
    Travel travel = new Travel();
    travel.startTime = Instant.now().minusSeconds(600);

    assertEquals(0, travel.calculateDuration());
    assertEquals(0, travel.duration);
  }

  @Test
  public void testCalculateSpeed() {
    Travel travel = new Travel();
    travel.startTime = Instant.now().minusSeconds(600);
    travel.endTime = Instant.now();
    travel.distance = 10.0;

    // 1 km/min = 60 km/h
    assertEquals(60, travel.calculateSpeed());
    assertEquals(60, travel.speed);
  }

  @Test
  public void testCalculateSpeedWhenNullDuration() {
    Travel travel = new Travel();
    travel.distance = 10.0;

    assertEquals(0, travel.calculateSpeed());
    assertEquals(0, travel.speed);
  }

  @Test
  public void testCalculateSpeedWhenDurationIsZero() {
    Travel travel = new Travel();
    travel.startTime = Instant.now();
    travel.endTime = Instant.now();
    travel.distance = 10.0;

    assertEquals(0, travel.calculateSpeed());
    assertEquals(0, travel.speed);
  }
}
