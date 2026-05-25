"use client";

import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TransportModeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TransportModeSelect({ value, onChange }: TransportModeSelectProps) {
  const t = useTranslations("Creator");
  const tModes = useTranslations("Charts.modes");

  return (
    <div className="space-y-2">
      <Label htmlFor="modeOfTransport" className="text-gray-700 dark:text-gray-300">
        {t("modeOfTransport")}
      </Label>
      <Select value={value} onValueChange={onChange}>
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
          <SelectItem value="mixed" title={tModes("mixedTooltip")}>
            🛸 {tModes("mixed")}
          </SelectItem>
          <SelectItem value="walking">🚶🏽 {tModes("walking")}</SelectItem>
          <SelectItem value="other">{tModes("other")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
