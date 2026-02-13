const getBaseHost = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return 'localhost';
};

const host = getBaseHost();

export const backendBaseUrl = `http://${host}:3000/api`;
export const v2BaseUrl = `http://${host}:8081/api/v2`;

export const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];