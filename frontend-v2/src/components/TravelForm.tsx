"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AutocompleteLocation } from "@/components/AutocompleteLocation";
import { getTimeFromCurrent } from "@/utils";
import VisitService from "@/services/VisitService";
import TravelService from "@/services/TravelService";
import UserService from "@/services/UserService";
import { useUser } from "@/contexts/UserContext";
import type { AxiosErrorResponse } from "@/types/commons";
import { Location } from "@/types/travel";

type Props = {
  locations: Location[]
};

const TravelForm = ({ locations }: Props) => {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    startTime: getTimeFromCurrent(2),
    endTime: getTimeFromCurrent(0),
    modeOfTransport: "car",
    distance: "",
    price: ""
  });
  const [createForAllUsers, setCreateForAllUsers] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (formData.startTime === formData.endTime) {
        toast.error("Start time and end time cannot be the same.");
        return;
      }
      if (new Date(formData.startTime) > new Date(formData.endTime)) {
        toast.error("Start time cannot be after end time.");
        return;
      }
      if (formData.origin === formData.destination) {
        toast.error("Origin and destination cannot be the same.");
        return;
      }
      
      // Validar que la duración no exceda 24 horas
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const durationMs = end.getTime() - start.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
      
      if (durationMs > oneDayMs) {
        toast.error("Travel duration cannot exceed 24 hours.");
        return;
      }

      if (createForAllUsers) {
        // Obtener todos los usuarios
        const users = await UserService.getAll();
        
        if (users.length === 0) {
          toast.error("No users found.");
          return;
        }

        // Crear viaje para cada usuario
        let successCount = 0;
        let errorCount = 0;
        
        for (const user of users) {
          try {
            await TravelService.create(formData, user.userId);
            await VisitService.persistIfNeeded(formData.startTime.split('T')[0], user.userId);
            successCount++;
          } catch (error) {
            console.error(`Error creating travel for user ${user.userId}:`, error);
            // Si es el error de duración, no continuar con los demás usuarios
            const axiosError = error as AxiosErrorResponse;
            if (axiosError.response?.status === 400 && axiosError.response?.data?.message?.includes('24 hours')) {
              toast.error("Travel duration cannot exceed 24 hours. Operation cancelled.");
              return;
            }
            errorCount++;
          }
        }

        if (errorCount === 0) {
          toast.success(`Travel created successfully for all ${successCount} users!`);
        } else {
          toast.warning(`Travel created for ${successCount} users, but ${errorCount} failed.`);
        }
      } else {
        // Crear viaje solo para el usuario actual
        const userId = currentUser?.userId;
        await TravelService.create(formData, userId);
        const persisted = await VisitService.persistIfNeeded(formData.startTime.split('T')[0], userId);
        
        if (persisted) {
          toast.success("Travel with visit added successfully!");
        } else {
          toast.success("Travel added successfully");
        }
      }

      setFormData({
        ...formData,
        origin: formData.destination,
        destination: formData.origin,
        startTime: formData.endTime,
        distance: "",
      });
    } catch (error) {
      console.error("There was an error adding the travel!", error, formData);
      
      // Manejar error específico de duración excedida
      const axiosError = error as AxiosErrorResponse;
      if (axiosError.response?.status === 400 && axiosError.response?.data?.message?.includes('24 hours')) {
        toast.error("Travel duration cannot exceed 24 hours.");
      } else {
        toast.error("Failed to add travel. Please try again.");
      }
    }
  };


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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="createForAllUsers"
              checked={createForAllUsers}
              onCheckedChange={(checked) => setCreateForAllUsers(checked === true)}
            />
            <Label
              htmlFor="createForAllUsers"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Create travel for all registered users
            </Label>
          </div>

          <Button type="submit" className="w-full">
            Create Travel
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TravelForm;
