import type { Travel, TravelEditProps } from "@/types/travel"

import { Input } from "../ui/input";

type Props = {
  editProps: TravelEditProps
  handleEdit: (travel: Travel) => void
}

const DateCell = ({ editProps, handleEdit }: Props) => {
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

  return (
    <span
      onClick={() => { handleEdit(travel); }}
      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
      title="Click to edit"
    >
      {travel.extractedDate}
    </span>
  );
}

export default DateCell