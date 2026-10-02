import { CrossRules } from "../domain/crossRules.js";
import { BusinessRuleError } from "../error/businessRuleError.js";
import Cross from "../models/Cross.js";
import Travel from "../models/Travel.js";

export const getAll = (req, res) => {
  Cross.find().sort({ name: 1 }).then(items => {
    res.json(items);
  }).catch(err => {
    res.status(500).json({ message: 'Failed to get all', error: err.message });
  });
}

export const create = (req, res) => {
  const { name, latitude, longitude } = req.body;

  const cross = new Cross({
    name,
    latitude,
    longitude,
  });

  cross.save().then(saved => {
    res.status(201).json(saved);
  }).catch(err => {
    res.status(400).json({ message: 'Failed to save', error: err.message });
  });
}

export const update = (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude } = req.body;

  Cross.findByIdAndUpdate(id, { name, latitude, longitude }, { new: true })
    .then(updated => {
      if (!updated) {
        return res.status(404).json({ message: 'Not found by id' });
      }
      res.json(updated);
    })
    .catch(err => {
      res.status(400).json({ message: 'Failed to update', error: err.message });
    }
    );
}

export const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const travelsCount = await Travel.countDocuments({ crosses: id });

    CrossRules.validateDeletable(travelsCount);

    const removed = await Cross.findByIdAndDelete(id);

    if (!removed) {
      return res.status(404).json({ message: 'Not found by id' });
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof BusinessRuleError) {
      return res.status(400).json({ message: error.message, name: error.name });
    }

    res.status(400).json({ message: 'Failed to remove', error: error.message });
  }
}
