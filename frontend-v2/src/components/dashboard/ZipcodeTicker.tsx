"use client";

import type { MonthlyStats, TravelStats } from "@/types/travel";

import { useEffect, useMemo, useState } from "react";

type Props = {
  monthlyStats: MonthlyStats;
  prevStats?: TravelStats;
};

const ZipcodeTicker = ({ monthlyStats, prevStats }: Props) => {
  const currentZipcodes = useMemo(() => {
    const all = new Set<string>();
    Object.values(monthlyStats).forEach(item => {
      item.zipcodes.forEach(z => all.add(z));
    });
    return all;
  }, [monthlyStats]);

  const allZipcodes = useMemo(() => {
    const combined = new Set(currentZipcodes);
    if (prevStats?.placesVisited?.zipcodes) {
      prevStats.placesVisited.zipcodes.forEach(z => combined.add(z));
    }
    return Array.from(combined).sort();
  }, [currentZipcodes, prevStats]);

  // Append first item at the end for seamless looping
  const displayList = useMemo(() => {
    if (allZipcodes.length === 0) return [];
    return [...allZipcodes, allZipcodes[0]];
  }, [allZipcodes]);

  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (allZipcodes.length > 0) {
      setIndex(Math.floor(Math.random() * allZipcodes.length));
    }
  }, [allZipcodes.length]);

  useEffect(() => {
    if (allZipcodes.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, [allZipcodes.length]);

  // Handle seamless loop jump
  useEffect(() => {
    if (index === displayList.length - 1 && index > 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(0);
      }, 700); // Match the duration of the transition
      return () => clearTimeout(timer);
    } else if (!isTransitioning && index === 0) {
      // Small delay to ensure the jump is finished before re-enabling transitions
      const timer = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [index, displayList.length, isTransitioning]);

  if (!isMounted || allZipcodes.length === 0) return null;

  return (
    <div className="h-5 overflow-hidden relative">
      <div
        className={isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}
        style={{ transform: `translateY(-${index * 20}px)` }}
      >
        {displayList.map((zip, i) => {
          const isVisited = currentZipcodes.has(zip);
          const isFrequent = isVisited && prevStats?.placesVisited?.zipcodes?.includes(zip);

          return (
            <div
              key={`${zip}-${i}`}
              className="flex items-center gap-2 text-[0.8rem] h-5 font-['Space_Mono']"
            >
              <span className="scale-75 origin-left">{isVisited ? '✅' : '❌'}</span>
              <span className={isFrequent ? 'text-[#e8ff47]' : 'text-[#fff]'}>
                {zip}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ZipcodeTicker;
