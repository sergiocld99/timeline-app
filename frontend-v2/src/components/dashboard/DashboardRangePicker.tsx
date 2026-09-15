"use client";

import { CalendarDays, Check, Eraser } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { usePathname, useRouter } from "@/i18n/routing";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Picker digits are Argentina wall-clock (see CLAUDE.md): they are serialized
// straight into the ISO string (never through new Date().toISOString()), so the
// stored value's date/track digits ARE the local ones consumers read.
const toIsoStartOfDay = (datePart: string) => `${datePart}T00:00:00.000Z`;
const toIsoEndOfDay = (datePart: string) => `${datePart}T23:59:59.999Z`;

type Props = {
  // The range the dashboard is currently showing, used to prefill the inputs
  // when the URL has no explicit from/to yet (i.e. the rolling 11-month window).
  defaultFrom?: string;
  defaultTo?: string;
};

// Adds months to a YYYY-MM-DD date part using UTC arithmetic (TZ-agnostic), so
// the returned value is the same digits regardless of machine timezone. Used to
// bound the "to" input: the dashboard charts only span the 11-month window.
const addMonthsToDatePart = (datePart: string, months: number): string => {
  if (!DATE_PATTERN.test(datePart)) return "";

  const [year, month, day] = datePart.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, 1));
  result.setUTCMonth(result.getUTCMonth() + months);
  const maxDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, maxDay));
  return result.toISOString().slice(0, 10);
};

const DashboardRangePicker = ({ defaultFrom, defaultTo }: Props) => {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [fromInput, setFromInput] = useState(fromParam?.slice(0, 10) ?? defaultFrom?.slice(0, 10) ?? "");
  const [toInput, setToInput] = useState(toParam?.slice(0, 10) ?? defaultTo?.slice(0, 10) ?? "");
  const [hint, setHint] = useState<"emptyRange" | "maxRangeMessage" | null>(null);

  useEffect(() => {
    setFromInput(fromParam?.slice(0, 10) ?? defaultFrom?.slice(0, 10) ?? "");
    setToInput(toParam?.slice(0, 10) ?? defaultTo?.slice(0, 10) ?? "");
    setHint(null);
  }, [fromParam, toParam, defaultFrom, defaultTo]);

  const isTooWide = Boolean(fromInput && toInput && toInput > addMonthsToDatePart(fromInput, 11));

  const applyRange = () => {
    if (isTooWide) {
      setHint("maxRangeMessage");
      return;
    }
    if (isRangeInvalid(fromInput, toInput)) {
      setHint("emptyRange");
      return;
    }
    setHint(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", toIsoStartOfDay(fromInput));
    params.set("to", toIsoEndOfDay(toInput));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const isRangeInvalid = (from: string, to: string) =>
    !DATE_PATTERN.test(from) || !DATE_PATTERN.test(to) || from > to;

  const resetRange = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  const renderControls = () => (
    <>
      <div className="space-y-1.5">
        <Label
          htmlFor="dash-range-from"
          className="text-[0.6rem] font-['Space_Mono'] uppercase tracking-[2px] text-[#8a8a9e]"
        >
          {t("fromLabel")}
        </Label>
        <Input
          id="dash-range-from"
          type="date"
          value={fromInput}
          onChange={(e) => setFromInput(e.target.value)}
          className="h-9 bg-[#0a0a0f] border-[#2a2a3a] text-[#f0f0f8]"
        />
      </div>
<div className="space-y-1.5">
          <Label
            htmlFor="dash-range-to"
            className="text-[0.6rem] font-['Space_Mono'] uppercase tracking-[2px] text-[#8a8a9e]"
          >
            {t("toLabel")}
          </Label>
          <Input
            id="dash-range-to"
            type="date"
            value={toInput}
            max={addMonthsToDatePart(fromInput, 11)}
            onChange={(e) => setToInput(e.target.value)}
            className="h-9 bg-[#0a0a0f] border-[#2a2a3a] text-[#f0f0f8]"
          />
        </div>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={applyRange}
          disabled={isTooWide}
          className="h-9 bg-[#e8ff47] text-[#0a0a0f] font-bold hover:bg-[#d8ef3a] disabled:bg-[#2a2a3a] disabled:text-[#8a8a9e] disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" />
          {t("applyRange")}
        </Button>
        <Button
          type="button"
          onClick={resetRange}
          variant="outline"
          className="h-9 bg-[#111118] border-[#2a2a3a] text-[#8a8a9e] hover:bg-[#1a1a22] hover:text-[#f0f0f8]"
        >
          <Eraser className="h-4 w-4" />
          {t("resetRange")}
        </Button>
      </div>
      {hint && (
        <p className="text-[0.65rem] font-['Space_Mono'] text-[#ff6b47]">
          {t(hint)}
        </p>
      )}
    </>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={`${t("fromLabel")} – ${t("toLabel")}`}
          title={`${t("fromLabel")} – ${t("toLabel")}`}
          className="bg-[#111118] border-[#2a2a3a] text-[#8a8a9e] hover:bg-[#1a1a22] hover:text-[#f0f0f8]"
        >
          <CalendarDays className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 bg-[#111118] border-[#2a2a3a] text-[#f0f0f8]">
        <div className="flex flex-col gap-3">{renderControls()}</div>
      </PopoverContent>
    </Popover>
  );
};

export default DashboardRangePicker;