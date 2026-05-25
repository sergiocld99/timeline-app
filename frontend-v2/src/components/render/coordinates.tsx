import { useTranslations } from "next-intl";
import { toast } from "sonner";

import CopyButton from "../buttons/CopyButton";

export const renderPoint = (latitude: number, longitude: number) => {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
}

export const handleCopyCoordinates = async (
  latitude: number, 
  longitude: number, 
  successMsg = 'Coordinates copied to clipboard!', 
  errorMsg = 'Failed to copy coordinates'
) => {
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
    toast.success(successMsg);
  } else {
    toast.error(errorMsg);
  }
} catch (err) {
  console.error('Fallback: Oops, unable to copy', err);
  toast.error(errorMsg);
      document.body.removeChild(textArea);
    }
  };

  if (!navigator.clipboard) {
    fallbackCopy(coordinates);
    return;
  }

  try {
    await navigator.clipboard.writeText(coordinates);
    toast.success(successMsg);
  } catch (error) {
    console.error('Failed to copy coordinates:', error);
    fallbackCopy(coordinates);
  }
};

export const PointWithCopyBtn = ({ latitude, longitude }: { latitude?: number; longitude?: number }) => {
  const t = useTranslations("Common.messages");

  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) return null

  return (
    <div className="flex items-center gap-2">
      <span>{renderPoint(latitude, longitude)}</span>
      <CopyButton handleClick={() => handleCopyCoordinates(latitude, longitude, t("copied"), t("copyError"))} />
    </div>
  )
}