import { Travel } from "../../types/travel"
import Header from "../components/Header"
import TravelForm from "../components/TravelForm"
import TravelTable from "../components/TravelTable"
import useTravels from "../hooks/useTravels"

const TravelsPage = () => {
  const { travels, refetch, updateTravel, deleteTravel } = useTravels()

  const handleUpdateDateRange = (dateFrom: string, dateTo: string) => {
    refetch(dateFrom, dateTo)
  }

  const handleUpdateTravel = async (id: string, updates: Partial<Travel>) => {
    try {
      await updateTravel(id, updates);
      // Refetch to ensure all data is up to date with proper weights
      refetch();
    } catch (error) {
      console.error('Error updating travel:', error);
      // Still refetch to ensure data consistency
      refetch();
    }
  }

  const handleDeleteTravel = async (id: string) => {
    try {
      await deleteTravel(id);
      // No need to refetch since deleteTravel updates local state
    } catch (error) {
      console.error('Error deleting travel:', error);
      // Refetch to ensure data consistency if deletion failed
      refetch();
    }
  }

  return (
    <>
      <Header />
      <main className="page-container">
        <TravelForm onTravelAdded={refetch} />
        <TravelTable 
          travels={travels} 
          onUpdateDateRange={handleUpdateDateRange} 
          onUpdateTravel={handleUpdateTravel}
          onDeleteTravel={handleDeleteTravel}
        />
      </main>
    </>
  )
}

export default TravelsPage