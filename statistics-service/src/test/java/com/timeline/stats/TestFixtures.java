package com.timeline.stats;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;

import org.bson.types.ObjectId;

import java.time.Instant;

/**
 * Fluent builders for domain fixtures used across statistics-service tests.
 * Each test declares only the fields it cares about; everything else keeps a
 * sensible default (e.g. a 1-hour trip, a fresh random id).
 */
public class TestFixtures {

  public static LocationBuilder aLocation() {
    return new LocationBuilder();
  }

  public static TravelBuilder aTravel() {
    return new TravelBuilder();
  }

  public static class LocationBuilder {
    private ObjectId id = new ObjectId();
    private String name;
    private String zipcode;
    private double latitude;
    private double longitude;

    public LocationBuilder withId(String hexId) {
      this.id = new ObjectId(hexId);
      return this;
    }

    /** Only for repository tests exercising Mongo's own id generation on persist. */
    public LocationBuilder withoutId() {
      this.id = null;
      return this;
    }

    public LocationBuilder named(String name) {
      this.name = name;
      return this;
    }

    public LocationBuilder at(String zipcode) {
      this.zipcode = zipcode;
      return this;
    }

    public LocationBuilder coordinates(double latitude, double longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
      return this;
    }

    public Location build() {
      Location location = new Location();
      location.id = id;
      location.name = name;
      location.zipcode = zipcode;
      location.latitude = latitude;
      location.longitude = longitude;
      return location;
    }
  }

  public static class TravelBuilder {
    private static final long DEFAULT_DURATION_SECONDS = 3600;

    private ObjectId id = new ObjectId();
    private ObjectId origin;
    private ObjectId destination;
    private Instant startTime;
    private Instant endTime;
    private Double distance;
    private Integer userId;

    public TravelBuilder from(Location origin) {
      this.origin = origin.id;
      return this;
    }

    public TravelBuilder to(Location destination) {
      this.destination = destination.id;
      return this;
    }

    public TravelBuilder on(String isoStartTime) {
      return startingAt(Instant.parse(isoStartTime));
    }

    public TravelBuilder startingAt(Instant startTime) {
      this.startTime = startTime;
      return this;
    }

    public TravelBuilder endingAt(Instant endTime) {
      this.endTime = endTime;
      return this;
    }

    public TravelBuilder km(double distance) {
      this.distance = distance;
      return this;
    }

    public TravelBuilder forUser(Integer userId) {
      this.userId = userId;
      return this;
    }

    public Travel build() {
      Travel travel = new Travel();
      travel.id = id;
      travel.origin = origin;
      travel.destination = destination;
      travel.startTime = startTime;
      travel.endTime = endTime != null ? endTime
          : (startTime != null ? startTime.plusSeconds(DEFAULT_DURATION_SECONDS) : null);
      travel.distance = distance;
      travel.userId = userId;
      return travel;
    }
  }
}
