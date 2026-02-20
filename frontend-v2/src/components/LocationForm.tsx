"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationService from "@/services/LocationService";

// Import MapPicker dynamically to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  ),
});

const LocationForm = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    zipcode: "",
    notes: "",
  });
  const [isMapOpen, setIsMapOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (newLocation: typeof formData) => LocationService.create(newLocation),
    onSuccess: (data) => {
      toast.success(`Location "${data.name}" added successfully!`);
      setFormData({
        name: "",
        latitude: "",
        longitude: "",
        zipcode: "",
        notes: "",
      });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (error) => {
      console.error("There was an error adding the location!", error);
      toast.error("Failed to add location. Please try again.");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(formData);
  };
  const handleMapSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    setIsMapOpen(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Add Location</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="location"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coordinates</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMapOpen(true)}
              className="flex items-center gap-2 h-8"
            >
              <MapPin className="h-4 w-4" />
              Pick on Map
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-gray-700 dark:text-gray-300">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                autoComplete="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-gray-700 dark:text-gray-300">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                autoComplete="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipcode" className="text-gray-700 dark:text-gray-300">Zipcode</Label>
            <Input
              id="zipcode"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <Button type="submit" className="w-full">
            Save Location
          </Button>
        </form>

        <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Pick Location on Map</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <MapPicker
                onSelect={handleMapSelect}
                initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LocationForm;
