import { getAvailableQuarters, getExportForQuarter } from "../services/exportService.js";

export const getQuarters = (req, res) => {
  const { userId } = req.query;

  getAvailableQuarters(userId).then(quarters => {
    res.json({ quarters });
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching available quarters', error: err.message });
  });
};

export const getTravelsExport = (req, res) => {
  const { quarter, userId } = req.query;

  if (!quarter) {
    return res.status(400).json({ message: 'quarter query param is required, e.g. quarter=2023-Q1' });
  }

  getExportForQuarter(quarter, userId).then(exportData => {
    res.json(exportData);
  }).catch(err => {
    res.status(400).json({ message: 'Error building export for quarter', error: err.message });
  });
};
