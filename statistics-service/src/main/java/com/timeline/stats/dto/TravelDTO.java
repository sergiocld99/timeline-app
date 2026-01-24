package com.timeline.stats.dto;

import org.bson.types.ObjectId;

public record TravelDTO(ObjectId id, ObjectId origin, ObjectId destination) {
}
