package com.timeline.stats.resource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;

import com.timeline.stats.dto.StatsRequestDTO;
import com.timeline.stats.dto.TravelDTO;
import com.timeline.stats.dto.TravelStatsDTO;
import com.timeline.stats.dto.PlacesVisitedDTO;
import com.timeline.stats.service.StatsService;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.ws.rs.core.MediaType;

@QuarkusTest
public class StatsResourceTest {

  @InjectMock
  StatsService statsService;

  @Test
  @SuppressWarnings("unchecked")
  public void testGetTravelStatsFromIds() {
    ObjectId travelId = new ObjectId();
    ObjectId originId = new ObjectId();
    ObjectId destinationId = new ObjectId();

    TravelDTO travelDTO = new TravelDTO(travelId, originId, destinationId);
    StatsRequestDTO request = new StatsRequestDTO(List.of(travelDTO));

    PlacesVisitedDTO placesVisitedDTO = new PlacesVisitedDTO(Set.of("12345"));
    TravelStatsDTO responseStats = new TravelStatsDTO(1, 10.0, 60.0, 15.0, 25.0, placesVisitedDTO, 1);

    when(statsService.calculateBasicStatsFromIds(any(List.class))).thenReturn(responseStats);

    given()
        .contentType(MediaType.APPLICATION_JSON)
        .body(request)
        .when()
        .post("/api/v2/stats/travels/from-ids")
        .then()
        .statusCode(200)
        .body("count", is(1))
        .body("totalDistance", is(10.0f))
        .body("totalMinutes", is(60.0f))
        .body("uniqueDays", is(1));
  }

  @Test
  public void testPing() {
    given()
        .when()
        .get("/api/v2/stats/ping")
        .then()
        .statusCode(200)
        .body("status", is("ok"));
  }
}
