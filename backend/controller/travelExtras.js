import { useCorrectUser } from "../helpers/useCorrectUser.js"
import Travel from "../models/Travel.js"
import Location from "../models/Location.js"
import { enrichTravels, getOverallSpeed } from "../services/travelService.js"
import { getDateFrom, getDateTo } from "../utils/index.js"

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = value instanceof Date ? value.toISOString() : String(value);
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
};

export const buildGraph = (req, res) => {
  const dateFrom = getDateFrom(req)
  const dateTo = getDateTo(req)
  const { userId } = req.query
  const weights = {}

  Travel.find({ ...useCorrectUser(userId), startTime: { $gte: dateFrom }, endTime: { $lte: dateTo } })
    .populate('origin destination').sort({ startTime: -1 }).then(travels => {
      const enrichedTravels = enrichTravels(travels);

      enrichedTravels.forEach(t => {
        const duration = t.get('duration');
        const A = t.origin.zipcode
        const B = t.destination.zipcode

        if (!weights[A]) { weights[A] = {} }
        if (!weights[A][B]) { weights[A][B] = { count: 0, duration } }
        weights[A][B].count++
      })

      res.json({ weights });
    }).catch(err => {
      res.status(500).json({ message: 'Error building graph', error: err.message });
    });
}

export const findLastTravel = async (req, res) => {
  const { origin, destination, userId } = req.query

  if (!origin || !destination) {
    return res.status(400).json({ message: 'Missing origin or destination' })
  }

  Travel.findOne({
    ...useCorrectUser(userId),
    origin,
    destination,
  }).sort({ startTime: -1 }).then(travel => {
    res.json(travel)
  }).catch(err => {
    res.status(500).json({ message: 'Error finding travel', error: err.message });
  })
}

export const findTravels = async (req, res) => {
  const { originCP, destCP, userId, limit } = req.query
  const dateFrom = getDateFrom(req)
  const dateTo = getDateTo(req)

  if (!originCP || !destCP) {
    return res.status(400).json({ message: 'Missing zipcodes in request' })
  }

  const originLocs = await Location.find({ zipcode: originCP }).select('_id')
  const destLocs = await Location.find({ zipcode: destCP }).select('_id')

  if (originLocs.length === 0 || destLocs.length === 0) {
    return res.status(404).json({
      message: 'No locations found with zipcode provided',
      originCount: originLocs.length,
      destCount: destLocs.length
    });
  }

  const originIds = originLocs.map(loc => loc._id);
  const destIds = destLocs.map(loc => loc._id);

  Travel.find({
    ...useCorrectUser(userId),
    origin: { $in: originIds },
    destination: { $in: destIds },
    startTime: { $gte: dateFrom },
    endTime: { $lte: dateTo }
  }).sort({ startTime: -1 }).limit(limit).then(travels => {
    const speedData = getOverallSpeed(travels)

    res.json({ count: travels.length, speed: speedData[2], sumKm: speedData[0], sumMin: speedData[1], travels })
  }).catch(err => {
    res.status(500).json({ message: 'Error finding travels', error: err.message });
  })
}

export const findAnyTravelsToCPs = async (req, res) => {
  const { userId } = req.query
  const { zipcodes = [] } = req.body

  const dateFrom = getDateFrom(req, 100)
  const dateTo = getDateTo(req)

  if (zipcodes.length === 0) {
    return res.status(400).json({ message: 'Missing zipcodes in request body' })
  }

  const locations = await Location.find({ zipcode: { $in: zipcodes } }).select('_id')
  const locIds = locations.map(loc => loc._id);

  if (locIds.length === 0) {
    return res.status(404).json({ message: 'No locations found for zipcodes provided' })
  }

  Travel.find({
    ...useCorrectUser(userId),
    destination: { $in: locIds },
    startTime: { $gte: dateFrom },
    endTime: { $lte: dateTo }
  }).populate("destination").sort({ startTime: -1 }).then(travels => {
    res.json({ count: travels.length, travels })
  }).catch(err => {
    res.status(500).json({ message: 'Error finding travels', error: err.message });
  })
}

export const exportTravelsCsv = async (req, res) => {
  try {
    const dateFrom = getDateFrom(req);
    const dateTo = getDateTo(req);
    const { userId } = req.query;

    const travels = await Travel.find({
      ...useCorrectUser(userId),
      startTime: { $gte: dateFrom },
      endTime: { $lte: dateTo }
    })
      .populate('origin destination crosses')
      .sort({ startTime: 1 });

    const headerRow = [
      'travelId',
      'startTime',
      'endTime',
      'modeOfTransport',
      'distanceKm',
      'durationMinutes',
      'price',
      'originName',
      'originZipcode',
      'destinationName',
      'destinationZipcode',
    ];

    const rows = travels.map(travel => {
      const durationMinutes = Math.round((travel.endTime - travel.startTime) / 60000);

      return [
        travel._id,
        travel.startTime,
        travel.endTime,
        travel.modeOfTransport,
        travel.distance,
        durationMinutes,
        travel.price ?? '',
        travel.origin?.name ?? '',
        travel.origin?.zipcode ?? '',
        travel.destination?.name ?? '',
        travel.destination?.zipcode ?? '',
      ];
    });

    const csvContent = [
      headerRow.map(escapeCsvValue).join(','),
      ...rows.map(row => row.map(escapeCsvValue).join(','))
    ].join('\n');

    const fromLabel = dateFrom.toISOString().split('T')[0];
    const toLabel = dateTo.toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="travels_${fromLabel}_${toLabel}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting travels', error: error.message });
  }
}
