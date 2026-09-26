"use client"

import type { Cross } from "@/types/cross";

import { Check, ChevronsUpDown, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AutocompleteCrossesProps = {
  crosses: Cross[]
  value: string[] // Array of selected cross IDs
  onValueChange: (value: string[]) => void
  placeholder?: string
}

export function AutocompleteCrosses({
  crosses,
  value,
  onValueChange,
  placeholder = "Select crosses...",
}: AutocompleteCrossesProps) {
  const t = useTranslations("Crosses");
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter crosses based on search
  const filteredCrosses = crosses.filter((cross) =>
    cross.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Handle selection (toggle)
  const handleSelect = (crossId: string) => {
    if (value.includes(crossId)) {
      onValueChange(value.filter((id) => id !== crossId))
    } else {
      onValueChange([...value, crossId])
    }
  }

  const handleRemove = (e: React.MouseEvent, crossId: string) => {
    e.stopPropagation()
    onValueChange(value.filter((id) => id !== crossId))
  }

  const renderFilteredCross = (cross: Cross) => {
    const isSelected = value.includes(cross._id)
    return (
      <div
        key={cross._id}
        onClick={(e) => {
          e.stopPropagation()
          handleSelect(cross._id)
        }}
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <span className="font-medium text-sm">{cross.name}</span>
        <Check
          className={cn(
            "ml-auto h-4 w-4",
            isSelected ? "opacity-100 text-blue-600 dark:text-blue-400" : "opacity-0"
          )}
        />
      </div>
    )
  }

  const renderDropdown = () => (
    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg" id="crosses-listbox">
      <div className="p-2" onClick={(e) => e.stopPropagation()}>
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-9 mb-2"
          autoFocus
        />
      </div>
      <div className="max-h-60 overflow-auto pb-2">
        {filteredCrosses.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            {t("noCrossesFound")}
          </div>
        ) : (
          filteredCrosses.map((cross) => renderFilteredCross(cross))
        )}
      </div>
    </div>
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearchValue("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        role="combobox"
        aria-expanded={open}
        aria-controls="crosses-listbox"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full min-h-10 flex min-h-10 flex-wrap items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          value.length === 0 && "text-muted-foreground"
        )}
      >
        <div className="flex flex-wrap gap-1 items-center flex-1">
          {value.length > 0 ? (
            value.map((id) => {
              const cross = crosses.find((c) => c._id === id)
              if (!cross) return null
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-0.5 text-xs font-medium text-gray-900 dark:text-white"
                >
                  {cross.name}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, id)}
                    className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5 focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </div>

      {open && renderDropdown()}
    </div>
  )
}
