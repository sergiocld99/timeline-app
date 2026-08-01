package com.timeline.stats.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.timeline.stats.dto.TopRouteDTO;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;

@QuarkusTest
public class RouteServiceTest {

  @Inject
  RouteService routeService;

  @Test
  public void testCalculateHomePicksMostFrequentEndpointAcrossTopTwoRoutes() {
    List<TopRouteDTO> topRoutes = List.of(
        new TopRouteDTO("Casa ↔ Trabajo", 10),
        new TopRouteDTO("Casa ↔ Gimnasio", 5),
        new TopRouteDTO("Casa ↔ Supermercado", 3));

    String home = routeService.calculateHome(topRoutes);

    assertEquals("Casa", home);
  }

  @Test
  public void testCalculateHomeReturnsNullForEmptyRoutes() {
    assertNull(routeService.calculateHome(List.of()));
  }

  @Test
  public void testReorderRoutesAroundHomePutsHomeFirst() {
    List<TopRouteDTO> topRoutes = List.of(
        new TopRouteDTO("Trabajo ↔ Casa", 10),
        new TopRouteDTO("Casa ↔ Gimnasio", 5));

    routeService.reorderRoutesAroundHome(topRoutes, "Casa");

    assertEquals("Casa ↔ Trabajo", topRoutes.get(0).route);
    assertEquals("Casa ↔ Gimnasio", topRoutes.get(1).route);
  }
}
