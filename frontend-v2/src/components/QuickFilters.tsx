"use client";

type FilterOption = {
  label: string;
  value: string;
}

type QuickFiltersProps = {
  options: FilterOption[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
}

const QuickFilters = ({ options, selectedValue, onSelect }: QuickFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(selectedValue === option.value ? null : option.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
            ${selectedValue === option.value
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default QuickFilters;
