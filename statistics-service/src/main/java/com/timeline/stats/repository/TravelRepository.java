package com.timeline.stats.repository;

import com.timeline.stats.domain.Travel;
import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.util.List;

/**
 * Repository for Travel entities - READ ONLY operations
 */
@ApplicationScoped
public class TravelRepository implements PanacheMongoRepository<Travel> {

  /**
   * Find travels by date range
   */
  public List<Travel> findByDateRange(Instant dateFrom, Instant dateTo) {
    return find("startTime >= ?1 and endTime <= ?2", dateFrom, dateTo).list();
  }

  /**
   * Find travels by date range and userId
   */
  public List<Travel> findByDateRangeAndUser(Instant dateFrom, Instant dateTo, Integer userId) {
    if (userId == null) {
      // Guest data (no userId)
      return find("startTime >= ?1 and endTime <= ?2 and userId = null", dateFrom, dateTo).list();
    }
    return find("startTime >= ?1 and endTime <= ?2 and userId = ?3", dateFrom, dateTo, userId).list();
  }

  /**
   * Count travels by date range
   */
  public long countByDateRange(Instant dateFrom, Instant dateTo) {
    return count("startTime >= ?1 and endTime <= ?2", dateFrom, dateTo);
  }
}
