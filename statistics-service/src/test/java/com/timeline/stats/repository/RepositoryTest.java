package com.timeline.stats.repository;

import static com.timeline.stats.TestFixtures.aLocation;
import static com.timeline.stats.TestFixtures.aTravel;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.timeline.stats.domain.Location;
import com.timeline.stats.domain.Travel;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;

@QuarkusTest
public class RepositoryTest {

  @Inject
  TravelRepository travelRepository;

  @Inject
  LocationRepository locationRepository;

  @Test
  public void testLocationRepositoryFindByIds() {
    Location loc = aLocation().withoutId().at("12345").build();
    locationRepository.persist(loc);
    assertNotNull(loc.id);

    List<Location> found = locationRepository.findByIds(Set.of(loc.id));
    assertEquals(1, found.size());
    assertEquals("12345", found.get(0).zipcode);
  }

  @Test
  public void testTravelRepositoryQueries() {
    Location loc = aLocation().withoutId().build();
    locationRepository.persist(loc);

    Instant start = Instant.now().minusSeconds(3600);
    Instant end = Instant.now();
    Travel travel = aTravel().from(loc).to(loc).startingAt(start).endingAt(end).km(10.0).forUser(999).build();
    travelRepository.persist(travel);

    List<Travel> range = travelRepository.findByDateRange(start.minusSeconds(10), end.plusSeconds(10));
    assertEquals(1, range.size());

    List<Travel> userRange = travelRepository.findByDateRangeAndUser(start.minusSeconds(10), end.plusSeconds(10), 999);
    assertEquals(1, userRange.size());

    long count = travelRepository.countByDateRange(start.minusSeconds(10), end.plusSeconds(10));
    assertEquals(1, count);
  }

  @Test
  public void testTravelRepositoryGuestQueries() {
    Location loc = aLocation().withoutId().build();
    locationRepository.persist(loc);

    Instant start = Instant.now().minusSeconds(3600);
    Instant end = Instant.now();
    Travel guestTravel = aTravel().from(loc).to(loc).startingAt(start).endingAt(end).km(10.0).build();
    Travel userTravel = aTravel().from(loc).to(loc).startingAt(start).endingAt(end).km(10.0).forUser(999).build();

    travelRepository.persist(guestTravel);
    travelRepository.persist(userTravel);

    List<Travel> userRange = travelRepository.findByDateRangeAndUser(start.minusSeconds(10), end.plusSeconds(10), null);
    assertEquals(1, userRange.size());
  }
}
