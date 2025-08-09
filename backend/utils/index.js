export const getDateFrom = (req, daysFallback = 30) => {
  if (req.query.dateFrom) {
    return new Date(req.query.dateFrom);
  }

  let dateFrom = new Date(Date.now());
  dateFrom.setDate(dateFrom.getDate() - daysFallback)
  dateFrom.setHours(0, 0, 0, 0);

  return dateFrom;
}

export const getDateTo = (req) => {
  const { dateTo } = req.query

  if (dateTo) {
    return new Date(dateTo)
  }

  let result = new Date(Date.now())
  result.setHours(23,59,59,0);

  return result;
}

export const isEven = (num) => num % 2 === 0

export const getMedian = (sortedArr) => {
  const len = sortedArr.length

  if (isEven(len)) {
    return (sortedArr[len / 2 - 1] + sortedArr[len / 2]) / 2
  }

  return sortedArr[(len-1) / 2]
}

export const withWeight = (sourceArr, sortingField) => {
  const len = sourceArr.length
  let values = []

  if (len === 0) {
    return sourceArr
  }

  sourceArr.forEach(v => values.push(v.get(sortingField)))
  values = values.sort((a,b) => a-b)

  const median = getMedian(values)
  const sum = values.reduce((total, curr) => total + curr, 0)

  return sourceArr.map(v => {
    const ratio = v.get(sortingField) / median

    v.set('weight', {
      color: ratio >= 2 ? '🔴' : ratio > 0.5 ? '🟡' : '🟢',
      percentage: 100 * v.get(sortingField) / sum
    }, { strict: false });

    return v
  })
}