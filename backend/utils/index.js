export const getDateFrom = (req, daysFallback = 30) => {
  if (req.query.dateFrom) {
    return new Date(req.query.dateFrom);
  }

  let dateFrom = new Date(Date.now());
  dateFrom.setDate(dateFrom.getDate() - daysFallback)

  return dateFrom;
}