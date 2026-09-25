import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  eligibleValues: Array<{ value: string, label: string }>;
  minLength: number;
}

export const Selector = ({ value, onValueChange, eligibleValues, minLength }: Props) => {
  if (eligibleValues.length < minLength) {
    return (
      <span className="text-gray-900 dark:text-white">{value}</span>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {eligibleValues.map(v => (
          <SelectItem key={`eligible-${v.value}`} value={v.value}>{v.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}