"use client"

import type { Location } from "@/types/travel"

import { Check, ChevronsUpDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AutocompleteLocationProps {
  locations: Location[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function AutocompleteLocation({
  locations,
  value,
  onValueChange,
  placeholder = "Select location...",
}: AutocompleteLocationProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find the selected location
  const selectedLocation = locations.find((location) => location._id === value)

  const renderLocation = (location: Location) => `${location.zipcode} - ${location.name}`

  // Filter locations based on search
  const filteredLocations = locations.filter((location) =>
    renderLocation(location).toLowerCase().includes(searchValue.toLowerCase())
  )

  // Handle selection
  const handleSelect = (locationId: string) => {
    onValueChange(locationId)
    setOpen(false)
    setSearchValue("")
  }

  // Auto-select first location if only one is found
  if (filteredLocations.length === 1) {
    handleSelect(filteredLocations[0]._id)
  }

  const renderFilteredLocation = (location: Location) => (
    <div
      key={location._id}
      onClick={() => handleSelect(location._id)}
      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <div className="flex flex-col">
        <span className="font-medium">{location.name}</span>
        <span className="text-sm text-muted-foreground">
          {location.zipcode}
        </span>
      </div>
      <Check
        className={cn(
          "ml-auto h-4 w-4",
          value === location._id ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  )

  const renderDropdown = () => (
    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
      <div className="p-2">
        <Input
          placeholder="Search locations..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-9 mb-2"
          autoFocus
        />
      </div>
      <div className="max-h-60 overflow-auto">
        {filteredLocations.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            No location found.
          </div>
        ) : (
          filteredLocations.map((location) => renderFilteredLocation(location))
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
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault()
          setOpen(!open)
        }}
        className={cn(
          "w-full justify-between bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white",
          !selectedLocation && "text-muted-foreground",
        )}
      >
        {selectedLocation ? renderLocation(selectedLocation) : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && renderDropdown()}
    </div>
  )
}
