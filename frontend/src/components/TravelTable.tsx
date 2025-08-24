import { ChangeEvent, useState } from 'react';
import type { Travel } from '../../types/travel';
import { getEmojiForMode, getTodayEndTime, getHoursAndMinutes, getStartDateFromCurrent } from '../utils';
import { renderTotalWeightsCell, renderWeight } from '../utils/weight';

import './TravelTable.scss';

type Props = {
  travels: Travel[];
  onUpdateDateRange: (dateFrom: string, dateTo: string) => void;
  onUpdateTravel?: (id: string, updates: Partial<Travel>) => Promise<void>;
}

const TravelTable = ({ travels, onUpdateDateRange, onUpdateTravel }: Props) => {
  const [dateFrom, setDateFrom] = useState(getStartDateFromCurrent(30))
  const [dateTo, setDateTo] = useState(getTodayEndTime())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ distance: string; duration: string }>({ distance: '', duration: '' })
  const [isSaving, setIsSaving] = useState(false)

  const totalMinutes = travels.reduce((total, travel) => total + travel.duration, 0);
  const totalDistance = travels.reduce((total, travel) => total + travel.distance, 0);

  const totalLat = travels.reduce((total, travel) => {
    const currentLat = (travel.origin.latitude + travel.destination.latitude) / 200
    return total + currentLat * travel.weight.percentage
  }, 0)

  const totalLong = travels.reduce((total, travel) => {
    const currentLong = (travel.origin.longitude + travel.destination.longitude) / 200
    return total + currentLong * travel.weight.percentage
  }, 0)

  const handleChangeDateFrom = (e: ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value)
  };

  const handleChangeDateTo = (e: ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value)
  };

  const handleEdit = (travel: Travel) => {
    setEditingId(travel._id);
    setEditValues({
      distance: travel.distance.toString(),
      duration: travel.duration.toString()
    });
  };

  const handleSave = async (travel: Travel) => {
    if (!onUpdateTravel) return;
    
    try {
      setIsSaving(true);
      const distance = parseFloat(editValues.distance);
      const duration = parseFloat(editValues.duration);
      
      if (isNaN(distance) || isNaN(duration) || distance < 0 || duration < 0) {
        alert('Please enter valid positive numbers for distance and duration');
        return;
      }

      await onUpdateTravel(travel._id, {
        distance,
        endTime: new Date(new Date(travel.startTime).getTime() + duration * 60000).toISOString()
      });
      
      setEditingId(null);
      setEditValues({ distance: '', duration: '' });
    } catch (error) {
      console.error('Error updating travel:', error);
      alert('Failed to update travel');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ distance: '', duration: '' });
  };

  const handleInputChange = (field: 'distance' | 'duration', value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const renderEditableCell = (travel: Travel, field: 'distance' | 'duration') => {
    if (editingId === travel._id) {
      return (
        <input
          type="number"
          step="0.1"
          min="0"
          value={editValues[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="edit-input"
        />
      );
    }
    
    return (
      <span 
        onClick={() => { handleEdit(travel); }}
        className="editable-field"
        title="Click to edit"
      >
        {field === 'distance' ? `${travel.distance} km` : `${travel.duration} min`}
      </span>
    );
  };

  const renderActionButtons = (travel: Travel) => {
    if (editingId === travel._id) {
      return (
        <div className="action-buttons">
          <button 
            onClick={() => { void handleSave(travel); }} 
            className="save-btn"
            disabled={isSaving}
          >
            {isSaving ? '⏳' : '✅'}
          </button>
          <button onClick={handleCancel} className="cancel-btn" disabled={isSaving}>❌</button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-table travel-table container">
      <div className="page-header">
        <h2>From</h2>
        <input type="datetime-local" name="date_from" id="date_from" onChange={handleChangeDateFrom} value={dateFrom} />
        <h2>to</h2>
        <input type="datetime-local" name="date_to" id="date_to" onChange={handleChangeDateTo} value={dateTo} />
        <button type="button" onClick={() => onUpdateDateRange(dateFrom, dateTo)}>✅</button>
      </div>
      <table>
        <thead>
          <tr>
            <th className='date-th'>Date</th>
            <th>M</th>
            <th>From</th>
            <th>To</th>
            <th>Distance</th>
            <th className='duration-th'>Duration</th>
            <th className='speed-th'>Speed</th>
            <th className='weight-th'>Weight</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {travels.map(t => (
            <tr key={t._id}>
              <td>{t.shortDate}</td>
              <td>{getEmojiForMode(t.modeOfTransport)}</td>
              <td>{t.origin.name}</td>
              <td>{t.destination.name}</td>
              <td>{renderEditableCell(t, 'distance')}</td>
              <td>{renderEditableCell(t, 'duration')}</td>
              <td>{t.speed.toFixed(1)} km/h</td>
              <td>{renderWeight(t)}</td>
              <td>{renderActionButtons(t)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td colSpan={3}>{totalLat.toFixed(4)}, {totalLong.toFixed(4)}</td>
            <td>{totalDistance.toFixed(0)} km</td>
            <td>{getHoursAndMinutes(totalMinutes)}</td>
            <td>{totalMinutes === 0 ? 0 : (totalDistance / (totalMinutes / 60)).toFixed(1)} km/h</td>
            <td>{renderTotalWeightsCell(travels)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TravelTable;