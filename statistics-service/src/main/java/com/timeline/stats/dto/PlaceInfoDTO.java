package com.timeline.stats.dto;

import java.util.List;

public record PlaceInfoDTO(String name, String id, List<String> months, double latitude, double longitude) {
}
