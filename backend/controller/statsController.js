import Visit from "../models/Visit.js"
import { getDateFrom } from "../utils/index.js"

export const getTopVisitedLocations = (req, res) => {
  const dateFrom = getDateFrom(req)
  const limit = Number(req.query.limit || 10)

  Visit.aggregate([
    { $match: { date: { $gte: dateFrom } } },
    { $group: { _id: '$location', totalMinutes: { $sum: '$durationMinutes' }, count: { $sum: 1 } } },
    { $sort: { totalMinutes: -1 } },
    { $limit: limit },
    { $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'location' } },
    { $unwind: '$location' },
    { $project: { _id: 0 } }
  ]).then(result => {
    res.status(200).json(result)
  }).catch((err) => {
    res.status(500).json(err)
  })
}