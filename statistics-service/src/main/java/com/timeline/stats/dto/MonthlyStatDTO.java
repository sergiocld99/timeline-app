package com.timeline.stats.dto;

import java.util.HashMap;
import java.util.Map;

import com.timeline.stats.domain.ZipcodeList;

public class MonthlyStatDTO {
  public double km;
  public double minutes;
  public int count;
  public ZipcodeList zipcodes = new ZipcodeList();
  public Map<String, Double> kmByZipcode = new HashMap<>();
}
