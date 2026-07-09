import type { Travel, TravelChangeFn, TravelEditProps, TravelEditValues } from "@/types/travel"

import { getEmojiForMode } from "@/utils"

import { Selector } from "../common/Selector"
import { Input } from "../ui/input"

const ELIGIBLE_MODES = ['car', 'taxi', 'bus', 'train', 'subway', 'ferry', 'mixed', 'walking']

type Props = {
  editProps: TravelEditProps
}

const renderEditableCell = ({ modeOfTransport, line }: TravelEditValues, handleChange: TravelChangeFn) => {
  const eligibleValues = ELIGIBLE_MODES.map(mode => ({ value: mode, label: getEmojiForMode(mode) }))

  return (
    <div className="flex flex-col">
      <Selector
        value={modeOfTransport}
        onValueChange={(value) => handleChange('modeOfTransport', value)}
        eligibleValues={eligibleValues}
        minLength={1}
      />
      {modeOfTransport === 'bus' && (
        <Input
          type="text"
          placeholder="Line"
          value={line}
          onChange={(e) => handleChange('line', e.target.value)}
          className="mt-1 w-16 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
        />
      )}
    </div>
  );
}

const renderReadOnlyCell = ({ modeOfTransport, line }: Travel) => {
  const showLine = modeOfTransport === 'bus' && line;

  return (
    <div className="text-gray-900 dark:text-white">
      {showLine ? (
        <span className="font-semibold text-yellow-600 dark:text-yellow-400">
          {line}
        </span>
      ) : (
        <span>{getEmojiForMode(modeOfTransport)}</span>
      )}
    </div>
  );
}

const TransportModeCell = ({ editProps }: Props) => {
  const { travel, editingId, editValues, handleChange } = editProps

  return editingId === travel._id ? renderEditableCell(editValues, handleChange) : renderReadOnlyCell(travel)
}

export default TransportModeCell