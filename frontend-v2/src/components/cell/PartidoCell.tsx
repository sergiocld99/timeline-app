import type { Location } from "@/types/location";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  location: Location;
  isEditing: boolean;
  value?: string;
  onChange: (value: string) => void;
  sortedPartidos: string[];
}

export const PartidoCell = ({
  location,
  isEditing,
  value,
  onChange,
  sortedPartidos
}: Props) => {
  const isBuenosAires = location.zipcode?.toUpperCase().startsWith('B');

  if (isEditing) {
    if (!isBuenosAires) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-36 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {sortedPartidos.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (!isBuenosAires) {
    return <span className="text-gray-700 dark:text-gray-300">-</span>;
  }

  return (
    <span className="text-gray-700 dark:text-gray-300">
      {location.partido || ""}
    </span>
  );
};
