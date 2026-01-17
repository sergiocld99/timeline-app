import { toast } from "sonner";

import CopyButton from "../buttons/CopyButton";

export const renderPoint = (latitude: number, longitude: number) => {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
}

export const handleCopyCoordinates = async (latitude: number, longitude: number) => {
  const coordinates = renderPoint(latitude, longitude);

  try {
    await navigator.clipboard.writeText(coordinates);
    toast.success('Coordinates copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy coordinates:', error);
    toast.error('Failed to copy coordinates');
  }
};

export const renderPointWithCopyBtn = (latitude?: number, longitude?: number) => {
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) return ""

  return (
    <div className="flex items-center gap-2">
      <span>{renderPoint(latitude, longitude)}</span>
      {latitude && longitude && (<CopyButton handleClick={() => handleCopyCoordinates(latitude, longitude)} />)}
    </div>
  )
}