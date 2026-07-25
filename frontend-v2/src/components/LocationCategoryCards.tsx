"use client";

import type { Location } from "@/types/location";

import { useMemo } from "react";
import Image from "next/image";
import { MapPinned, Building2, Flag } from "lucide-react";
import { useTranslations } from "next-intl";

import { PARTIDO_FILTER_PREFIX } from "@/constants/partidos";

interface LocationCategoryCardsProps {
  locations: Location[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
}

type Category = {
  value: "B" | "C" | "U";
  titleKey: string;
  icon: typeof MapPinned;
  gradient: string;
  // Silhouette used as a watermark motif over the gradient
  image: string;
};

const CATEGORIES: Category[] = [
  { value: "B", titleKey: "buenosAires", icon: MapPinned, gradient: "from-emerald-500 to-green-700", image: "/categories/pba.png" },
  { value: "C", titleKey: "capital", icon: Building2, gradient: "from-indigo-500 to-blue-700", image: "/categories/caba.png" },
  { value: "U", titleKey: "uruguay", icon: Flag, gradient: "from-sky-400 to-cyan-600", image: "/categories/uy.png" },
];

const LocationCategoryCards = ({ locations, selectedValue, onSelect }: LocationCategoryCardsProps) => {
  const t = useTranslations("Locations.categories");

  const counts = useMemo(() => {
    const acc: Record<string, number> = { B: 0, C: 0, U: 0 };
    for (const loc of locations) {
      const prefix = loc.zipcode?.[0]?.toUpperCase();
      if (prefix && prefix in acc) acc[prefix] += 1;
    }
    return acc;
  }, [locations]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {CATEGORIES.map(({ value, titleKey, icon: Icon, gradient, image }) => {
        // A per-partido filter (PARTIDO:...) is a subset of Buenos Aires province,
        // so it keeps the "B" card marked as selected too.
        const isSelected =
          selectedValue === value ||
          (value === "B" && !!selectedValue?.startsWith(PARTIDO_FILTER_PREFIX));
        return (
          <button
            key={value}
            onClick={() => onSelect(isSelected ? null : value)}
            aria-pressed={isSelected}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient}
              min-h-36 sm:min-h-44 p-5 text-left text-white shadow-md transition-all
              hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40
              ${isSelected ? "ring-4 ring-white/70 shadow-xl" : ""}`}
          >
            {/* Map silhouette as a decorative watermark motif */}
            <Image
              src={image}
              alt=""
              aria-hidden
              width={200}
              height={200}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-32 w-auto object-contain opacity-20
                mix-blend-overlay transition-transform duration-300 group-hover:scale-105"
            />

            <Icon className="relative h-9 w-9 opacity-90 drop-shadow-sm" strokeWidth={1.75} />
            <div className="absolute bottom-5 left-5 right-5 flex flex-col justify-end">
              <span className="text-xl font-semibold drop-shadow-sm">{t(titleKey)}</span>
              <span className="text-sm text-white/85">
                {t("count", { count: counts[value] })}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default LocationCategoryCards;
