"use client";

import type { Location } from "@/types/location";
import type { Cross } from "@/types/cross";

import { useTranslations } from "next-intl";

import { AutocompleteLocation } from "@/components/autocomplete/AutocompleteLocation";
import { AutocompleteCrosses } from "@/components/autocomplete/AutocompleteCrosses";
import { StateCheckbox } from "@/components/widgets/StateCheckbox";
import TransportModeSelect from "@/components/selectors/TransportModeSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useTravelCreator from "@/hooks/useTravelCreator";

type Props = {
  locations: Location[]
  crosses: Cross[]
};

const TravelForm = ({ locations, crosses }: Props) => {
  const t = useTranslations("Creator");
  const {
    formData, handleChange, handleStartTimeChange, handleSubmit,
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
              {/* Split in two fields so the date can be kept while the hour is left blank after creating a travel */}
              <div className="flex gap-2">
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startTime.split('T')[0] ?? ''}
                  onChange={(e) => handleStartTimeChange("date", e.target.value)}
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime.split('T')[1] ?? ''}
                  onChange={(e) => handleStartTimeChange("time", e.target.value)}
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-gray-700 dark:text-gray-300">{t("endTime")}</Label>
              <Input
                id="endTime"
                name="endTime"
                type={isSameDay ? 'time' : 'datetime-local'}
                value={isSameDay ? formData.endTime.split('T')[1] ?? '' : formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TransportModeSelect
              value={formData.modeOfTransport}
              onChange={(value) => handleChange("modeOfTransport", value)}
            />

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
