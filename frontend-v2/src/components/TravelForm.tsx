"use client";

import type { Location } from "@/types/location";
import type { Cross } from "@/types/cross";

import { useTranslations } from "next-intl";

import { AutocompleteLocation } from "@/components/AutocompleteLocation";
import { AutocompleteCrosses } from "@/components/AutocompleteCrosses";
import { StateCheckbox } from "@/components/StateCheckbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useTravelCreator from "@/hooks/useTravelCreator";

type Props = {
  locations: Location[]
  crosses: Cross[]
};

const TravelForm = ({ locations, crosses }: Props) => {
  const t = useTranslations("Creator");
  const tModes = useTranslations("Charts.modes");
  const {
    formData, handleChange, handleSubmit,
    createForAllUsers, setCreateForAllUsers,
    isSameDay, setIsSameDay
  } = useTravelCreator()

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{t("addTravel")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="origin" className="text-gray-700 dark:text-gray-300">{t("origin")}</Label>
              <AutocompleteLocation
                locations={locations}
                value={formData.origin}
                onValueChange={(value) => handleChange("origin", value)}
                placeholder={t("selectOrigin")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination" className="text-gray-700 dark:text-gray-300">{t("destination")}</Label>
              <AutocompleteLocation
                locations={locations}
                value={formData.destination}
                onValueChange={(value) => handleChange("destination", value)}
                placeholder={t("selectDestination")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-gray-700 dark:text-gray-300">{t("startTime")}</Label>
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
              <Label htmlFor="endTime" className="text-gray-700 dark:text-gray-300">{t("endTime")}</Label>
              <Input
                id="endTime"
                name="endTime"
                type={isSameDay ? 'time' : 'datetime-local'}
                value={isSameDay ? formData.endTime.split('T')[1] : formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="modeOfTransport" className="text-gray-700 dark:text-gray-300">{t("modeOfTransport")}</Label>
              <Select value={formData.modeOfTransport} onValueChange={(value) => handleChange("modeOfTransport", value)}>
                <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">🚘 {tModes("car")}</SelectItem>
                  <SelectItem value="taxi">🚖 {tModes("taxi")}</SelectItem>
                  <SelectItem value="bus">🚍 {tModes("bus")}</SelectItem>
                  <SelectItem value="train">🚉 {tModes("train")}</SelectItem>
                  <SelectItem value="subway">🚇 {tModes("subway")}</SelectItem>
                  <SelectItem value="ferry">⛴️ {tModes("ferry")}</SelectItem>
                  <SelectItem value="mixed" title="Travel with 2 modes of transport: one with greater distance and one with greater duration">🛸 {tModes("mixed")}</SelectItem>
                  <SelectItem value="walking">🚶🏽 {tModes("walking")}</SelectItem>
                  <SelectItem value="other">{tModes("other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.modeOfTransport === 'bus' && (
              <div className="space-y-2">
                <Label htmlFor="line" className="text-gray-700 dark:text-gray-300">{t("busLine")}</Label>
                <Input
                  id="line"
                  name="line"
                  type="text"
                  placeholder={t("busLinePlaceholder")}
                  value={formData.line}
                  onChange={(e) => handleChange("line", e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="distance" className="text-gray-700 dark:text-gray-300">{t("distanceKm")}</Label>
              <Input
                id="distance"
                name="distance"
                type="number"
                value={formData.distance}
                onChange={(e) => handleChange("distance", e.target.value)}
                required
                min="0"
                step="0.01"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-700 dark:text-gray-300">{t("priceOptional")}</Label>
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

            <div className="space-y-2 md:col-span-full">
              <Label htmlFor="crosses" className="text-gray-700 dark:text-gray-300">{t("crossesOptional")}</Label>
              <AutocompleteCrosses
                crosses={crosses}
                value={formData.crosses}
                onValueChange={(value) => handleChange("crosses", value)}
                placeholder={t("selectCrossesPlaceholder")}
              />
            </div>
          </div>

          <StateCheckbox id="isSameDay" stateStatus={isSameDay} stateSetter={setIsSameDay}>
            {t("startsAndFinishesSameDay")}
          </StateCheckbox>

          <StateCheckbox id="createForAllUsers" stateStatus={createForAllUsers} stateSetter={setCreateForAllUsers}>
            {t("createForAllUsers")}
          </StateCheckbox>

          <Button type="submit" className="w-full">
            {t("createTravel")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TravelForm;
