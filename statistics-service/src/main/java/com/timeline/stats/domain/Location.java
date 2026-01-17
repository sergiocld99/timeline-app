package com.timeline.stats.domain;

import org.bson.types.ObjectId;

import io.quarkus.mongodb.panache.common.MongoEntity;

@MongoEntity(collection = "locations")
public class Location {
  public ObjectId id;
  public String zipcode;
}
