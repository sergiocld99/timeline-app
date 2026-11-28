package com.timeline.stats.domain;

import java.util.LinkedList;

public class OrderedSet extends LinkedList<String> {
  
  public void put(String value) {
    if (!contains(value)) {
      add(value);
    }
  }
}
