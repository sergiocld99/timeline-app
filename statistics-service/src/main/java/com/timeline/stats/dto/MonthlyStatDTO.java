package com.timeline.stats.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MonthlyStatDTO {
  public double km;
  public double minutes;
  public int count;
  public List<String> zipcodes = new ArrayList<>();
  public Map<String, Double> kmByZipcode = new HashMap<>();
}
