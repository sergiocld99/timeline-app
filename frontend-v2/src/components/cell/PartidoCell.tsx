import type { Location } from "@/types/location";

import { BaseSelector } from "../selectors/BaseSelector";

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
      <BaseSelector
        value={value || ""}
        onValueChange={onChange}
        options={sortedPartidos}
        className="w-36"
        placeholder="Select..."
      />
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
