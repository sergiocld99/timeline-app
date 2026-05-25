"use client";

import { DateRangeProvider } from "@/contexts/DateRangeContext";
import LocationCommonViewer from "@/app/[locale]/travels/commonViewer";

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

