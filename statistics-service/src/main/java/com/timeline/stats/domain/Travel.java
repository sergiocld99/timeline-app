package com.timeline.stats.domain;

import io.quarkus.mongodb.panache.common.MongoEntity;
import org.bson.types.ObjectId;

import java.time.Instant;

/**
 * Travel entity - READ ONLY
 * This entity only reads from MongoDB, all writes are done by the Node.js
 * backend
 */
@MongoEntity(collection = "travels")
public class Travel {

  public ObjectId id;
  public Instant startTime;
  public Instant endTime;
  public ObjectId origin;
  public ObjectId destination;
  public String modeOfTransport;
  public Double distance;
  public Double price;
  public Integer userId;

  // Calculated fields (not stored in DB)
  public transient Double duration; // in minutes
  public transient Double speed; // km/h
  public transient String date;

  public Travel() {
  }

  /**
   * Calculate duration in minutes
   */
  public Double calculateDuration() {
    if (startTime == null || endTime == null) {
      this.duration = 0.0;
      return 0.0;
    }
    long millisDiff = endTime.toEpochMilli() - startTime.toEpochMilli();
    this.duration = millisDiff / (1000.0 * 60.0);
    return this.duration;
  }

  /**
   * Calculate speed in km/h
   */
  public Double calculateSpeed() {
    if (duration == null) {
      calculateDuration();
    }
    if (duration == 0) {
      this.speed = 0.0;
      return this.speed;
    }
    this.speed = (distance / duration) * 60.0;
    return this.speed;
  }

  /**
   * Enrich travel with calculated fields
   */
  public Travel enrich() {
    calculateDuration();
    calculateSpeed();
    this.date = startTime.toString().split("T")[0];
    return this;
  }
}
