import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  sortedPartidos: string[];
  className?: string;
  placeholder?: string;
}

export const PartidoSelector = ({
  value,
  onValueChange,
  sortedPartidos,
  className,
  placeholder = "Select a partido"
}: Props) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white", className)}>
        <SelectValue placeholder={placeholder} />
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
};
