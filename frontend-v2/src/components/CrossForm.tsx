"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CrossService from "@/services/CrossService";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";


// Import MapPicker dynamically to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  ),
});

const CrossForm = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });
  const [isMapOpen, setIsMapOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (newCross: typeof formData) => CrossService.create(newCross),
    onSuccess: (data) => {
      toast.success(`Cross "${data.name}" added successfully!`);
      setFormData({
        name: "",
        latitude: "",
        longitude: "",
      });
      queryClient.invalidateQueries({ queryKey: ["crosses"] });
    },
    onError: (err) => {
      toast.error(`Failed to add cross: ${err}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleMapSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
    });
    setIsMapOpen(false);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Add Cross</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="cross"
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

          <Button type="submit" className="w-full">
            Add Cross
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

export default CrossForm;