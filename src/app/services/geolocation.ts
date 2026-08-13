// ============================================================
// Geolocation Service
// GPS utilities for location-based attendance verification.
// ============================================================

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
}

export interface LocationCheckResult {
  valid: boolean;
  distance: number; // meters
  maxDistance: number; // meters
  studentPosition: GeoPosition;
}

/**
 * Get the current GPS position of the user.
 * Returns a promise that resolves with coordinates.
 */
export const getCurrentPosition = (): Promise<GeoPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser. Please use a modern browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location services in your browser settings to mark attendance.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable. Please try again or check your device settings.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out. Please try again.'));
            break;
          default:
            reject(new Error('An unknown error occurred while getting your location.'));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Always get fresh position
      }
    );
  });
};

/**
 * Calculate the distance between two GPS coordinates using the Haversine formula.
 * Returns distance in meters.
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Convert degrees to radians.
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Check if a student's position is within the allowed radius of the lecturer's position.
 */
export const isWithinRadius = (
  studentLat: number,
  studentLng: number,
  lecturerLat: number,
  lecturerLng: number,
  radiusMeters: number = 50
): LocationCheckResult => {
  const distance = calculateDistance(studentLat, studentLng, lecturerLat, lecturerLng);

  return {
    valid: distance <= radiusMeters,
    distance: Math.round(distance),
    maxDistance: radiusMeters,
    studentPosition: {
      latitude: studentLat,
      longitude: studentLng,
      accuracy: 0,
    },
  };
};
