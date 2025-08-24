import { Travel } from "../../types/travel"
import Header from "../components/Header"
import TravelForm from "../components/TravelForm"
import TravelTable from "../components/TravelTable"
import useTravels from "../hooks/useTravels"

const TravelsPage = () => {
  const { travels, refetch, updateTravel } = useTravels()

  const handleUpdateDateRange = (dateFrom: string, dateTo: string) => {
    refetch(dateFrom, dateTo)
  }

  const handleUpdateTravel = async (id: string, updates: Partial<Travel>) => {
    try {
      await updateTravel(id, updates);
    } catch (error) {
      console.error('Error updating travel:', error);
    } finally {
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
        />
      </main>
    </>
  )
}

export default TravelsPage