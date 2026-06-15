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

type Props = {
  travel: Travel | null
  setTravel: Dispatch<SetStateAction<Travel | null>>
}

const DetailsModal = ({ travel, setTravel }: Props) => {
  const t = useTranslations("Travels")
  const tModes = useTranslations("Charts.modes")

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
                    {new Date(travel.startTime).toLocaleString()} 
                    <br />
                    <span className="text-gray-400 font-medium">{t("to")}</span> 
                    <br />
                    {new Date(travel.endTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.mode") || "Transport Mode"}</h4>
                  <p className="capitalize">{tModes(travel.modeOfTransport)}</p>
                  {travel.line && (
                    <p className="text-xs text-gray-400">{t("line")} {travel.line}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 grid grid-cols-3 gap-2">
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.distance") || "Distance"}</h4>
                  <p>{travel.distance} km</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.duration") || "Duration"}</h4>
                  <p>{travel.duration} min</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.speed") || "Speed"}</h4>
                  <p>{travel.speed?.toFixed(1) || 0} km/h</p>
                </div>
              </div>

              {travel.crosses && travel.crosses.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("crosses")}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {travel.crosses.map((c) => (
                      <span key={c._id} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-0.5 rounded">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("notes") || "Notes"}</h4>
                {travel.notes ? (
                  <p className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-gray-700 dark:text-gray-300 italic mt-1 border border-gray-100 dark:border-gray-800">
                    {travel.notes}
                  </p>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic mt-1">{t("emptyNotes")}</p>
                )}
              </div>
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