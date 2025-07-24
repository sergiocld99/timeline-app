import Header from "../components/Header"
import LocationForm from "../components/LocationForm"
import LocationTable from "../components/LocationTable"
import useSortedLocations from '../hooks/useSortedLocations';

const LocationsPage = () => {
  const { sortedLocations, refetch } = useSortedLocations();

  return (
    <>
      <Header />
      <main className='page-container'>
        <LocationForm onLocationAdded={refetch} />
        <LocationTable locations={sortedLocations} />
      </main>
    </>
  )
}

export default LocationsPage