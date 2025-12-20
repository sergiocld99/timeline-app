export const useCorrectUser = (userId) => {
  return userId ? { userId: parseInt(userId, 10) } : { 
    $or: [
      { userId: { $exists: false } },
      { userId: null }
    ]
  }
}