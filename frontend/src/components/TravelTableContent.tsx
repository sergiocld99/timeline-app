import { useState } from 'react';
import type { Travel } from '../../types/travel';
import { getEmojiForMode, getHoursAndMinutes } from '../utils';
import { renderTotalWeightsCell, renderWeight } from '../utils/weight';
import toast from 'react-hot-toast';

import './TravelTable.scss';

type Props = {
  travels: Travel[];
  onUpdate: (id: string, updates: Partial<Travel>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const TravelTableContent = ({ travels, onUpdate, onDelete }: Props) => {
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

  const handleEdit = (travel: Travel) => {
    setEditingId(travel._id);
    setEditValues({
      distance: travel.distance.toString(),
      duration: travel.duration.toString()
    });
  };

  const handleSave = async (travel: Travel) => {
    if (!onUpdate) return;

    try {
      setIsSaving(true);
      const distance = parseFloat(editValues.distance);
      const duration = parseFloat(editValues.duration);

      if (isNaN(distance) || isNaN(duration) || distance <= 0 || duration <= 0) {
        toast.error('Please enter valid positive numbers for distance and duration');
        return;
      }

      await onUpdate(travel._id, {
        distance,
        endTime: new Date(new Date(travel.startTime).getTime() + duration * 60000).toISOString()
      });

      setEditingId(null);
      setEditValues({ distance: '', duration: '' });
    } catch (error) {
      console.error('Error updating travel:', error);
      toast.error('Failed to update travel');
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

  const handleDelete = async (travel: Travel) => {
    if (!onDelete) return;

    try {
      setIsSaving(true);
      await onDelete(travel._id);
      toast.success('Travel deleted successfully!');
    } catch (error) {
      console.error('Error deleting travel:', error);
      toast.error('Failed to delete travel');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditableCell = (travel: Travel, field: 'distance' | 'duration', step: number) => {
    if (editingId === travel._id) {
      return (
        <input
          type="number"
          step={step}
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
    
    return (
      <div className="action-buttons">
        <button
          onClick={() => { void handleEdit(travel); }}
          className="edit-btn"
          title="Edit travel"
        >
          ✏️
        </button>
        <button
          onClick={() => { void handleDelete(travel); }}
          className="delete-btn"
          title="Delete travel"
        >
          🗑️
        </button>
      </div>
    );
  };

  return (
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
            <td>{renderEditableCell(t, 'distance', 0.1)}</td>
            <td>{renderEditableCell(t, 'duration', 1)}</td>
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
  )
}

export default TravelTableContent;