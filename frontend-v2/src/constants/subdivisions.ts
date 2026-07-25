import { BUENOS_AIRES_PARTIDOS } from "./partidos";
import { CABA_BARRIOS } from "./barrios";

// Prefix used to distinguish a subdivision quick-filter (by name, stored in
// `Location.partido`) from a plain zipcode-prefix category filter.
export const SUBDIVISION_FILTER_PREFIX = "SUBDIV:";

export type SubdivisionConfig = {
  // First char of the zipcode this subdivision applies to (matches a category card).
  prefix: string;
  // i18n key for the subdivision label (resolved under the consumer's namespace).
  labelKey: string;
  // Valid subdivision names for this jurisdiction.
  options: string[];
};

// Registry of location subdivisions keyed by zipcode prefix. Add a new entry
// (e.g. Uruguay departamentos, prefix "U") to support another jurisdiction —
// no backend/schema/stats-service changes are needed, since every subdivision
// name is stored in the generic `Location.partido` field.
export const SUBDIVISIONS: SubdivisionConfig[] = [
  { prefix: "B", labelKey: "partido", options: BUENOS_AIRES_PARTIDOS },
  { prefix: "C", labelKey: "barrio", options: CABA_BARRIOS },
];

// The subdivision configured for a given zipcode, if any.
export const getSubdivisionConfig = (zipcode?: string): SubdivisionConfig | undefined =>
  zipcode ? SUBDIVISIONS.find((s) => zipcode.toUpperCase().startsWith(s.prefix)) : undefined;

// The category prefix that owns a given subdivision name (used to keep the
// matching category card selected while a subdivision quick-filter is active).
export const getPrefixForSubdivisionName = (name: string): string | undefined =>
  SUBDIVISIONS.find((s) => s.options.includes(name))?.prefix;
