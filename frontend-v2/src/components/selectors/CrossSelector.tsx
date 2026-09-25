import type { FilteringByCross } from '@/types/stats';

import { useTranslations } from 'next-intl';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useCrosses from '@/hooks/useCrosses';

export const FILTER_ALL = 'all'

type Props = {
  onFilter: (data?: FilteringByCross) => void;
  selectedCrossId: string;
  setSelectedCrossId: (id: string) => void;
  isDisabled: boolean
}

const CrossSelector = ({ onFilter, selectedCrossId, setSelectedCrossId, isDisabled }: Props) => {
  const { crosses } = useCrosses();
  const t = useTranslations("Travels")

  return (
    <Select value={selectedCrossId} onValueChange={(value) => {
      onFilter?.({ type: 'cross', value: value === FILTER_ALL ? '' : value })
      setSelectedCrossId(value)
    }} disabled={isDisabled}>
      <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white h-9">
        <SelectValue placeholder={t("filterByCross")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={FILTER_ALL}>{t("allCrosses")}</SelectItem>
        {crosses.map((cross) => (
          <SelectItem key={cross._id} value={cross._id}>
            {cross.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default CrossSelector