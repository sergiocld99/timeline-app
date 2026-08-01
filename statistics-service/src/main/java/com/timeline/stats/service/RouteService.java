package com.timeline.stats.service;

import com.timeline.stats.dto.TopRouteDTO;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Picks and formats the "home" location out of a set of top routes.
 * Ported from backend/services/routeService.js.
 */
@ApplicationScoped
public class RouteService {

  public static final String ROUTE_SEPARATOR = " ↔ ";

  /**
   * Picks the location that appears most often across the top-2 routes by
   * frequency, out of the given top routes (already sorted by count desc).
   */
  public String calculateHome(List<TopRouteDTO> topRoutes) {
    if (topRoutes.isEmpty()) {
      return null;
    }

    List<String> candidates = new ArrayList<>();
    addRouteEndpoints(topRoutes.get(0), candidates);
    if (topRoutes.size() > 1) {
      addRouteEndpoints(topRoutes.get(1), candidates);
    }

    String bestCompetitor = null;
    long maxAppearances = -1;

    for (String competitor : candidates) {
      long appearances = topRoutes.stream().filter(r -> r.route.contains(competitor)).count();
      if (appearances > maxAppearances) {
        maxAppearances = appearances;
        bestCompetitor = competitor;
      }
    }

    return bestCompetitor;
  }

  private void addRouteEndpoints(TopRouteDTO route, List<String> candidates) {
    for (String endpoint : route.route.split(Pattern.quote(ROUTE_SEPARATOR))) {
      if (!candidates.contains(endpoint)) {
        candidates.add(endpoint);
      }
    }
  }

  /** Rewrites each route string so `home` always comes first. */
  public void reorderRoutesAroundHome(List<TopRouteDTO> topRoutes, String home) {
    for (TopRouteDTO route : topRoutes) {
      if (!route.route.contains(home)) {
        continue;
      }
      String[] endpoints = route.route.split(Pattern.quote(ROUTE_SEPARATOR));
      String other = endpoints[0].equals(home) ? endpoints[1] : endpoints[0];
      route.route = home + ROUTE_SEPARATOR + other;
    }
  }
}
