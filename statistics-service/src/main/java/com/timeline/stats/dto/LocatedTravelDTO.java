package com.timeline.stats.dto;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;

public record LocatedTravelDTO(Travel travel, Location origin, Location destination) {
}