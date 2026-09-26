import Header from "@/components/layout/Header";
import LocationViewerPageClient from "@/components/pages/LocationViewerPageClient";

type Props = {
  params: Promise<{
    locationId: string;
  }>;
};

const LocationViewerPage = async ({ params }: Props) => {
  const { locationId } = await params;

  return (
    <>
      <Header />
      <LocationViewerPageClient locationId={locationId} action="from" />
    </>
  );
};

export default LocationViewerPage;