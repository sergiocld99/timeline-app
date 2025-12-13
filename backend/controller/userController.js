import User from "../models/User.js";

export const getAllUsers = (req, res) => {
  User.find().sort({ userId: 1 }).then(users => {
    res.json(users);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  });
}

export const getUserById = (req, res) => {
  const { userId } = req.params;
  const userIdNum = parseInt(userId, 10);

  User.findOne({ userId: userIdNum }).then(user => {
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  });
}

export const createUser = (req, res) => {
  const { userId, name } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ message: 'userId and name are required' });
  }

  const user = new User({
    userId: parseInt(userId, 10),
    name
  });

  user.save().then(savedUser => {
    res.status(201).json(savedUser);
  }).catch(err => {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User with this userId already exists', error: err.message });
    }
    res.status(400).json({ message: 'Error creating user', error: err.message });
  });
}

export const updateUser = (req, res) => {
  const { userId } = req.params;
  const userIdNum = parseInt(userId, 10);
  const { name } = req.body;

  User.findOneAndUpdate({ userId: userIdNum }, { name }, { new: true }).then(updatedUser => {
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  }).catch(err => {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  });
}

export const deleteUser = (req, res) => {
  const { userId } = req.params;
  const userIdNum = parseInt(userId, 10);

  User.findOneAndDelete({ userId: userIdNum }).then(deletedUser => {
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(deletedUser);
  }).catch(err => {
    res.status(400).json({ message: 'Error deleting user', error: err.message });
  });
}

