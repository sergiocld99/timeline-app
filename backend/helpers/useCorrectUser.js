export const useCorrectUser = (userId) => {
  return userId ? { userId: parseInt(userId, 10) } : {}
}