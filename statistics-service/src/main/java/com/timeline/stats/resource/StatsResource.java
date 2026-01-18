package com.timeline.stats.resource;

import com.timeline.stats.dto.TravelStatsDTO;
import com.timeline.stats.dto.StatsRequestDTO;
import com.timeline.stats.service.StatsService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * REST API for travel statistics
 */
@Path("/api/v2/stats")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Statistics", description = "Travel statistics endpoints")
public class StatsResource {

  @Inject
  StatsService statsService;

  @GET
  @Path("/ping")
  @Operation(summary = "Health check endpoint")
  public String ping() {
    return "{\"status\":\"ok\",\"service\":\"statistics-service\",\"version\":\"1.0.0\"}";
  }

  @GET
  @Path("/travels/summary")
  @Operation(summary = "Get basic travel statistics")
  public TravelStatsDTO getTravelStats(
      @QueryParam("dateFrom") String dateFromStr,
      @QueryParam("dateTo") String dateToStr,
      @QueryParam("userId") Integer userId) {
    // Default: last 30 days
    Instant dateTo = dateToStr != null ? Instant.parse(dateToStr) : Instant.now();
    Instant dateFrom = dateFromStr != null ? Instant.parse(dateFromStr) : dateTo.minus(30, ChronoUnit.DAYS);

    return statsService.calculateBasicStats(dateFrom, dateTo, userId);
  }

  @POST
  @Path("/travels/from-weighted")
  @Operation(summary = "Get basic travel statistics from weighted travels")
  public TravelStatsDTO getTravelStatsFromWeighted(StatsRequestDTO request) {
    return statsService.calculateBasicStatsFromWeighted(request.travels());
  }
}
