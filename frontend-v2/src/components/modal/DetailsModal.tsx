import type { Dispatch, SetStateAction } from "react";
import type { Travel } from "@/types/travel";

import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { extractTime, getEmojiForMode } from "@/utils";
import { renderNiceDate } from "@/utils/date";

import CrossSection from "./CrossSection";
import NotesSection from "./NotesSection";

type Props = {
  travel: Travel | null
  setTravel: Dispatch<SetStateAction<Travel | null>>
}

const DetailsModal = ({ travel, setTravel }: Props) => {
  const t = useTranslations("Travels")
  const tModes = useTranslations("Charts.modes")
  const tRoot = useTranslations()

  return (
    <Dialog open={!!travel} onOpenChange={(open) => !open && setTravel(null)}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>{t("details")}</DialogTitle>
        </DialogHeader>
        {travel && (
          <div className="space-y-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.from") || "Origin"}</h4>
                <p>{travel.origin.name}</p>
                {travel.origin.zipcode && (
                  <p className="text-xs text-gray-400">{t("zip")} {travel.origin.zipcode}</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.to") || "Destination"}</h4>
                <p>{travel.destination.name}</p>
                {travel.destination.zipcode && (
                  <p className="text-xs text-gray-400">{t("zip")} {travel.destination.zipcode}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.schedule") || "Schedule"}</h4>
                <p>
                  {renderNiceDate(travel.startTime, tRoot)} {extractTime(travel.startTime)}
                  <br />
                  <span className="text-gray-400 font-medium">{t("to")}</span>
                  <br />
                  {renderNiceDate(travel.endTime, tRoot)} {extractTime(travel.endTime)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.mode") || "Transport Mode"}</h4>
                <p className="capitalize">{getEmojiForMode(travel.modeOfTransport)} {tModes(travel.modeOfTransport)}</p>
                {travel.line && (
                  <p className="text-xs text-gray-400">{t("line")} {travel.line}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 grid grid-cols-3 gap-2">
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.distance")}</h4>
                <p>{travel.distance} km</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.duration")}</h4>
                <p>{travel.duration} min</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.speed")}</h4>
                <p>{travel.speed?.toFixed(1) || 0} km/h</p>
              </div>
              {
                travel.price ? (
                  <>
                    <div>
                      <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.price")}</h4>
                      <p>${travel.price.toFixed(0)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.pricePerKm")}</h4>
                      <p>${(travel.price / travel.distance).toFixed(0)} / km</p>
                    </div>
                  </>
                ) : null
              }
            </div>

            <CrossSection crosses={travel.crosses} title={t("crosses")} />
            <NotesSection notes={travel.notes} title={t("notes")} emptyNotesMsg={t("emptyNotes")} />
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setTravel(null)}>{t("close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DetailsModal