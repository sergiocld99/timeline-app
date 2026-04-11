package com.timeline.stats.resource;

import com.timeline.stats.dto.TravelStatsDTO;
import com.timeline.stats.dto.StatsRequestDTO;
import com.timeline.stats.service.StatsService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

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

  @POST
  @Path("/travels/from-ids")
  @Operation(summary = "Get basic travel statistics from weighted travels")
  public TravelStatsDTO getTravelStatsFromWeighted(StatsRequestDTO request) {
    return statsService.calculateBasicStatsFromIds(request.travels());
  }

  @POST
  @Path("/travels/map-config")
  @Operation(summary = "Get map configuration from travels")
  public com.timeline.stats.dto.MapConfigDTO getMapConfig(StatsRequestDTO request) {
    return statsService.calculateBasicStatsFromIds(request.travels()).mapConfig;
  }
}
