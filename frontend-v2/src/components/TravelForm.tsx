"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutocompleteLocation } from "@/components/AutocompleteLocation";
import { StateCheckbox } from "@/components/StateCheckbox";
import { Location } from "@/types/travel";
import useTravelCreator from "@/hooks/useTravelCreator";

type Props = {
  locations: Location[]
};

const TravelForm = ({ locations }: Props) => {
  const {
    formData, handleChange, handleSubmit,
    createForAllUsers, setCreateForAllUsers,
    isSameDay, setIsSameDay
  } = useTravelCreator()

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Add Travel</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="origin" className="text-gray-700 dark:text-gray-300">Origin</Label>
              <AutocompleteLocation
                locations={locations}
                value={formData.origin}
                onValueChange={(value) => handleChange("origin", value)}
                placeholder="Select Origin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination" className="text-gray-700 dark:text-gray-300">Destination</Label>
              <AutocompleteLocation
                locations={locations}
                value={formData.destination}
                onValueChange={(value) => handleChange("destination", value)}
                placeholder="Select Destination"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-gray-700 dark:text-gray-300">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-gray-700 dark:text-gray-300">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="modeOfTransport" className="text-gray-700 dark:text-gray-300">Mode of Transport</Label>
              <Select value={formData.modeOfTransport} onValueChange={(value) => handleChange("modeOfTransport", value)}>
                <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">🚘 Car</SelectItem>
                  <SelectItem value="taxi">🚖 Taxi</SelectItem>
                  <SelectItem value="bus">🚍 Bus</SelectItem>
                  <SelectItem value="train">🚉 Train</SelectItem>
                  <SelectItem value="subway">🚇 Subway</SelectItem>
                  <SelectItem value="ferry">⛴️ Ferry</SelectItem>
                  <SelectItem value="walking">🚶🏽 Walking</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance" className="text-gray-700 dark:text-gray-300">Distance (km)</Label>
              <Input
                id="distance"
                name="distance"
                type="number"
                value={formData.distance}
                onChange={(e) => handleChange("distance", e.target.value)}
                required
                min="0"
                step="0.1"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-700 dark:text-gray-300">Price (optional)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                min="0"
                step="0.01"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <StateCheckbox id="isSameDay" stateStatus={isSameDay} stateSetter={setIsSameDay}>
            Starts and finishes on the same day
          </StateCheckbox>
          
          <StateCheckbox id="createForAllUsers" stateStatus={createForAllUsers} stateSetter={setCreateForAllUsers}>
            Create travel for all registered users
          </StateCheckbox>

          <Button type="submit" className="w-full">
            Create Travel
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TravelForm;
