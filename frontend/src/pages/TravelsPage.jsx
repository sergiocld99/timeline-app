import Header from "../components/Header"
import TravelForm from "../components/TravelForm"
import useTravels from "../hooks/useTravels"

const TravelsPage = () => {
  const { travels, refetch } = useTravels()

  return (
    <>
      <Header />
      <main className="page-container">
        <TravelForm onTravelAdded={refetch} />
      </main>
    </>
  )
}

export default TravelsPage