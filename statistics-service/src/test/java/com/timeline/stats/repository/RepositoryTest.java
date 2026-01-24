package com.timeline.stats.repository;

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
    Location loc = new Location();
    loc.zipcode = "12345";
    locationRepository.persist(loc);
    assertNotNull(loc.id);

    List<Location> found = locationRepository.findByIds(Set.of(loc.id));
    assertEquals(1, found.size());
    assertEquals("12345", found.get(0).zipcode);
  }

  @Test
  public void testTravelRepositoryQueries() {
    Location loc = new Location();
    locationRepository.persist(loc);

    Travel travel = new Travel();
    travel.startTime = Instant.now().minusSeconds(3600);
    travel.endTime = Instant.now();
    travel.origin = loc.id;
    travel.destination = loc.id;
    travel.distance = 10.0;
    travel.userId = 999;

    travelRepository.persist(travel);

    List<Travel> range = travelRepository.findByDateRange(travel.startTime.minusSeconds(10),
        travel.endTime.plusSeconds(10));
    assertEquals(1, range.size());

    List<Travel> userRange = travelRepository.findByDateRangeAndUser(travel.startTime.minusSeconds(10),
        travel.endTime.plusSeconds(10), 999);
    assertEquals(1, userRange.size());

    long count = travelRepository.countByDateRange(travel.startTime.minusSeconds(10), travel.endTime.plusSeconds(10));
    assertEquals(1, count);
  }

  @Test
  public void testTravelRepositoryGuestQueries() {
    Location loc = new Location();
    locationRepository.persist(loc);

    Travel guestTravel = new Travel();
    guestTravel.startTime = Instant.now().minusSeconds(3600);
    guestTravel.endTime = Instant.now();
    guestTravel.distance = 10.0;
    guestTravel.origin = loc.id;
    guestTravel.destination = loc.id;
    guestTravel.userId = null;

    Travel userTravel = new Travel();
    userTravel.startTime = guestTravel.startTime;
    userTravel.endTime = guestTravel.endTime;
    userTravel.distance = guestTravel.distance;
    userTravel.origin = loc.id;
    userTravel.destination = loc.id;
    userTravel.userId = 999;

    travelRepository.persist(guestTravel);
    travelRepository.persist(userTravel);

    List<Travel> userRange = travelRepository.findByDateRangeAndUser(guestTravel.startTime.minusSeconds(10),
        guestTravel.endTime.plusSeconds(10), null);
    assertEquals(1, userRange.size());
  }
}
