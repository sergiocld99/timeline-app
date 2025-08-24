import Header from "../components/Header"
import VisitTable from "../components/VisitTable"
import useVisits from "../hooks/useVisits"

const VisitsPage = () => {
  const { visits, refetch } = useVisits()

  const handleUpdateDateRange = (dateFrom: string, dateTo: string) => {
    refetch(dateFrom, dateTo)
  }

  return (
    <>
      <Header />
      <main className="page-container">
        <VisitTable visits={visits} onUpdateDateRange={handleUpdateDateRange} />
      </main>
    </>
  )
}

export default VisitsPage