import type { ButtonProps } from "@/types/props";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const SearchAction = ({ handleClick }: ButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={t("search")}
    >
      <SearchIcon className="h-4 w-4" />
    </Button>
  )
}

export default SearchAction