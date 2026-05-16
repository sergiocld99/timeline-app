import type { Travel, TravelEditProps } from "@/types/travel"

import { useTranslations, useFormatter } from "next-intl"


import { Input } from "../ui/input";

type Props = {
  editProps: TravelEditProps
  handleEdit: (travel: Travel) => void
}

const DateCell = ({ editProps, handleEdit }: Props) => {
  const t = useTranslations("Travels");
  const format = useFormatter();
  const { travel, editingId, editValues, handleChange } = editProps

  if (editingId === travel._id) {
    return (
      <Input
        type="date"
        value={editValues.date}
        required={true}
        onChange={(e) => handleChange('date', e.target.value)}
        className="w-36 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
      />
    );
  }

  const formattedDate = format.dateTime(new Date(travel.startTime), {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });

  return (
    <span
      onClick={() => { handleEdit(travel); }}
      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
      title={t("tooltips.clickToEdit")}
    >
      {formattedDate}
    </span>
  );
}

export default DateCell