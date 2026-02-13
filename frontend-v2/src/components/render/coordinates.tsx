import { toast } from "sonner";

import CopyButton from "../buttons/CopyButton";

export const renderPoint = (latitude: number, longitude: number) => {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
}

export const handleCopyCoordinates = async (latitude: number, longitude: number) => {
  const coordinates = renderPoint(latitude, longitude);

  // Fallback for insecure contexts (HTTP)
  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ensure the textarea is off-screen
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        toast.success('Coordinates copied to clipboard!');
      } else {
        toast.error('Failed to copy coordinates');
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      toast.error('Failed to copy coordinates');
      document.body.removeChild(textArea);
    }
  };

  if (!navigator.clipboard) {
    fallbackCopy(coordinates);
    return;
  }

  try {
    await navigator.clipboard.writeText(coordinates);
    toast.success('Coordinates copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy coordinates:', error);
    fallbackCopy(coordinates);
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