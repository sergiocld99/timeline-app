package com.timeline.stats.repository;

import com.timeline.stats.domain.Location;
import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.bson.types.ObjectId;

import java.util.List;
import java.util.Set;

@ApplicationScoped
public class LocationRepository implements PanacheMongoRepository<Location> {

  public List<Location> findByIds(Set<ObjectId> ids) {
    return find("_id in ?1", ids).list();
  }
}
