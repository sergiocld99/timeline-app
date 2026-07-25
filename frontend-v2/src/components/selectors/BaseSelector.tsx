import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  className?: string;
  placeholder?: string;
}

export const BaseSelector = ({
  value,
  onValueChange,
  options,
  className,
  placeholder
}: Props) => {
  const t = useTranslations("Common");

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white", className)}>
        <SelectValue placeholder={placeholder ?? t("select")} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
