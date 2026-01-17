import type { ButtonProps } from "@/types/props";

import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const BUTTON_TITLE = "Search"

const SearchAction = ({ handleClick }: ButtonProps) => {
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={BUTTON_TITLE}
    >
      <SearchIcon className="h-4 w-4" />
    </Button>
  )
}

export default SearchAction