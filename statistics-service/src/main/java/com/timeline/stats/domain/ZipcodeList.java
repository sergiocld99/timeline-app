package com.timeline.stats.domain;

import java.util.ArrayList;

public class ZipcodeList extends ArrayList<String> {
  
  public void put(String zipcode) {
    if (!contains(zipcode)) {
      add(zipcode);
    }
  }
}
