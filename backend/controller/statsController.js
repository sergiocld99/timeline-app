import { useCorrectUser } from "../helpers/useCorrectUser.js"
import Travel from "../models/Travel.js"
import Visit from "../models/Visit.js"
import { getDateFrom, getDateTo } from "../utils/index.js"

export const getTopVisitedLocations = (req, res) => {
  const dateFrom = getDateFrom(req)
  const limit = Number(req.query.limit || 10)
  const { userId } = req.query

  Visit.aggregate([
    { $match: { ...useCorrectUser(userId), date: { $gte: dateFrom } } },
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

export const getTravelStatsByMode = (req, res) => {
  const dateFrom = getDateFrom(req)
  const dateTo = getDateTo(req)
  const { userId } = req.query

  Travel.aggregate([
    { $match: { ...useCorrectUser(userId), startTime: { $gte: dateFrom }, endTime: { $lte: dateTo } } },
    { $group: { 
      _id: '$modeOfTransport', 
      totalMinutes: { $sum: { $divide: [ { $subtract: ['$endTime', '$startTime'] }, 1000 * 60 ] } },
      totalKm: { $sum: '$distance' },
      count: { $sum: 1 } } 
    },
    { $sort: { totalMinutes: -1 } },
    { $project: { _id: 0, modeOfTransport: '$_id', totalMinutes: 1, count: 1, totalKm: 1 } }
  ]).then(result => {
    res.status(200).json(result)
  }).catch((err) => {
    res.status(500).json(err)
  })
}