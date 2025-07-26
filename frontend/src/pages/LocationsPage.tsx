import Header from "../components/Header"
import LocationForm from "../components/LocationForm"
import LocationTable from "../components/LocationTable"
import useLocations from '../hooks/useLocations';

const LocationsPage = () => {
  const { locations, refetch } = useLocations();

  return (
    <>
      <Header />
      <main className='page-container'>
        <LocationForm onLocationAdded={refetch} />
        <LocationTable locations={locations} />
      </main>
    </>
  )
}

export default LocationsPage