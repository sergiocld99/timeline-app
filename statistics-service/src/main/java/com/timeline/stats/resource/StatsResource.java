package com.timeline.stats.resource;

import com.timeline.stats.dto.TravelStatsDTO;
import com.timeline.stats.dto.StatsRequestDTO;
import com.timeline.stats.dto.MapConfigDTO;
import com.timeline.stats.dto.DashboardStatsDTO;
import com.timeline.stats.service.StatsService;
import com.timeline.stats.service.MapService;
import com.timeline.stats.service.DashboardService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;

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

  @Inject
  MapService mapService;

  @Inject
  DashboardService dashboardService;

  @GET
  @Path("/ping")
  @Operation(summary = "Health check endpoint")
  public String ping() {
    return "{\"status\":\"ok\",\"service\":\"statistics-service\",\"version\":\"1.0.0\"}";
  }

  @POST
  @Path("/travels/from-ids")
  @Operation(summary = "Get basic travel statistics from weighted travels")
  public TravelStatsDTO getTravelStatsFromWeighted(StatsRequestDTO request) {
    return statsService.calculateBasicStatsFromIds(request.travels());
  }

  @POST
  @Path("/travels/map-config")
  @Operation(summary = "Get map configuration from travels")
  public MapConfigDTO getMapConfig(StatsRequestDTO request) {
    return mapService.calculateMapConfigFromIds(request.travels());
  }

  @GET
  @Path("/dashboard")
  @Operation(summary = "Get dashboard statistics (monthly breakdown, top routes, home) for a date range")
  public DashboardStatsDTO getDashboardStats(
      @QueryParam("dateFrom") String dateFrom,
      @QueryParam("dateTo") String dateTo,
      @QueryParam("userId") Integer userId) {
    return dashboardService.calculateDashboardStats(Instant.parse(dateFrom), Instant.parse(dateTo), userId);
  }
}
