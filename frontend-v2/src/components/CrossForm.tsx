"use client";

import { useState } from "react";
import { toast } from "sonner";

import CrossService from "@/services/CrossService";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  onSave: () => void;
}

const CrossForm = ({ onSave }: Props) => {

  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    CrossService.create(formData).then((data) => {
      toast.success(`Cross "${data.name}" added successfully!`);
      setFormData({
        name: "",
        latitude: "",
        longitude: "",
      })
      onSave();
    }).catch(err => {
      toast.error(`Failed to add cross: ${err}`);
    })
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
      </CardContent>
    </Card>
  );
};

export default CrossForm;