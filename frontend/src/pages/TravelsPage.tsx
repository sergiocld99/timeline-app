import Header from "../components/Header"
import TravelForm from "../components/TravelForm"
import TravelTable from "../components/TravelTable"
import useTravels from "../hooks/useTravels"

const TravelsPage = () => {
  const { travels, refetch } = useTravels()

  const handleUpdateDateRange = (dateFrom: string, dateTo: string) => {
    refetch(dateFrom, dateTo)
  }

  return (
    <>
      <Header />
      <main className="page-container">
        <TravelForm onTravelAdded={refetch} />
        <TravelTable travels={travels} onUpdateDateRange={handleUpdateDateRange} />
      </main>
    </>
  )
}

export default TravelsPage