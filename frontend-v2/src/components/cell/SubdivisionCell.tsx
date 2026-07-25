import type { Location } from "@/types/location";

import { getSubdivisionConfig } from "@/constants/subdivisions";

import { BaseSelector } from "../selectors/BaseSelector";

type Props = {
  location: Location;
  isEditing: boolean;
  value?: string;
  onChange: (value: string) => void;
  options: string[];
};

export const SubdivisionCell = ({
  location,
  isEditing,
  value,
  onChange,
  options,
}: Props) => {
  const hasSubdivision = !!getSubdivisionConfig(location.zipcode);

  if (isEditing) {
    if (!hasSubdivision) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <BaseSelector
        value={value || ""}
        onValueChange={onChange}
        options={options}
        className="w-36"
      />
    );
  }

  if (!hasSubdivision) {
    return <span className="text-gray-700 dark:text-gray-300">-</span>;
  }

  return (
    <span className="text-gray-700 dark:text-gray-300">
      {location.partido || ""}
    </span>
  );
};
