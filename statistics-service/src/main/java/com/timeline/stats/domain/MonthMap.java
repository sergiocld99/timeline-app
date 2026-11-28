package com.timeline.stats.domain;

import java.util.TreeMap;

// TreeMap so the "YYYY-MM" keys come out chronologically for any consumer
public class MonthMap<T> extends TreeMap<String, T> { 

}
