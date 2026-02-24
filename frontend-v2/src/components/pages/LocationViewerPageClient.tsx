"use client";

import LocationCommonViewer from "@/app/travels/commonViewer";
import { DateRangeProvider } from "@/contexts/DateRangeContext";

type Props = {
  locationId: string;
  action: 'from' | 'to';
};

const LocationViewerPageClient = ({ locationId, action }: Props) => {
  return (
    <DateRangeProvider initialDays={365}>
      <LocationCommonViewer locationId={locationId} action={action} />
    </DateRangeProvider>
  );
};

export default LocationViewerPageClient;

