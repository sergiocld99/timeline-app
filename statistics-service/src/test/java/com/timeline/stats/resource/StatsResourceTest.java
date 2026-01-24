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
  public void testGetTravelStatsFromWeighted() {
    ObjectId travelId = new ObjectId();
    ObjectId originId = new ObjectId();
    ObjectId destinationId = new ObjectId();

    TravelDTO travelDTO = new TravelDTO(travelId, originId, destinationId);
    StatsRequestDTO request = new StatsRequestDTO(List.of(travelDTO));

    TravelStatsDTO responseStats = new TravelStatsDTO(1, 10.0, 60.0, 15.0, 25.0, new PlacesVisitedDTO(Set.of("12345")));

    when(statsService.calculateBasicStatsFromWeighted(any(List.class))).thenReturn(responseStats);

    given()
        .contentType(MediaType.APPLICATION_JSON)
        .body(request)
        .when()
        .post("/api/v2/stats/travels/from-ids")
        .then()
        .statusCode(200)
        .body("count", is(1))
        .body("totalDistance", is(10.0f))
        .body("totalMinutes", is(60.0f));
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

  @Test
  public void testGetTravelStats() {
    TravelStatsDTO responseStats = new TravelStatsDTO(1, 10.0, 60.0, 15.0, 25.0, new PlacesVisitedDTO(Set.of("12345")));
    when(statsService.calculateBasicStats(any(), any(), any())).thenReturn(responseStats);

    given()
        .queryParam("dateFrom", "2026-01-01T00:00:00Z")
        .queryParam("dateTo", "2026-01-31T23:59:59Z")
        .queryParam("userId", 1)
        .when()
        .get("/api/v2/stats/travels/summary")
        .then()
        .statusCode(200)
        .body("count", is(1));
  }
}
