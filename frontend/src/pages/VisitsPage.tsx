import Header from "../components/Header"
import VisitTable from "../components/VisitTable"
import useVisits from "../hooks/useVisits"

const VisitsPage = () => {
  const { visits } = useVisits()

  return (
    <>
      <Header />
      <main className="page-container">
        <VisitTable visits={visits} />
      </main>
    </>
  )
}

export default VisitsPage