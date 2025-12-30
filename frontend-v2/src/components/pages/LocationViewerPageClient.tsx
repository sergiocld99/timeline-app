"use client";

import LocationCommonViewer from "@/app/travels/commonViewer";

type Props = {
  locationId: string;
  action: 'from' | 'to';
};

const LocationViewerPageClient = ({ locationId, action }: Props) => {
  return <LocationCommonViewer locationId={locationId} action={action} />;
};

export default LocationViewerPageClient;

