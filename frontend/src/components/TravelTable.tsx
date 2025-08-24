import type { Travel } from '../../types/travel';

import './TravelTable.scss';
import DateRangeSelector from './DateRangeSelector';
import TravelTableContent from './TravelTableContent';

type Props = {
  travels: Travel[];
  onUpdateDateRange: (dateFrom: string, dateTo: string) => void;
  onUpdateTravel: (id: string, updates: Partial<Travel>) => Promise<void>;
  onDeleteTravel: (id: string) => Promise<void>;
}

const TravelTable = ({ travels, onUpdateDateRange, onUpdateTravel, onDeleteTravel }: Props) => {
  return (
    <div className="page-table travel-table container">
      <DateRangeSelector onUpdate={onUpdateDateRange} />
      <TravelTableContent 
        travels={travels} 
        onUpdate={onUpdateTravel} 
        onDelete={onDeleteTravel}
      />
    </div>
  );
}

export default TravelTable;