package com.timeline.stats.dto;

import java.util.List;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;

public class StatsContextDTO {
  public List<LocatedTravelDTO> locatedTravels;
  public List<Location> locations;

  public StatsContextDTO(List<Travel> travels, List<Location> locations) {
    this.locations = locations;

    this.locatedTravels = travels.stream().map(t -> {
      Location origin = locations.stream().filter(l -> l.id.equals(t.origin)).findFirst().orElse(null);
      Location destination = locations.stream().filter(l -> l.id.equals(t.destination)).findFirst().orElse(null);
      return new LocatedTravelDTO(t, origin, destination);
    }).toList();
  }
}
