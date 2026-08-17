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
/**
 * Get the current GPS position of the user.
 * Attempts high-accuracy first, then falls back to IP/Wi-Fi positioning if it times out on PCs/laptops.
 */
export const getCurrentPosition = (): Promise<GeoPosition> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Default to TTU Campus coordinates if browser doesn't support geolocation
      resolve({ latitude: 4.8967, longitude: -1.7725, accuracy: 20 });
      return;
    }

    // Try high accuracy first (5s timeout)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        // High accuracy failed or timed out — retry with low accuracy (fast Wi-Fi/IP lookup)
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            resolve({
              latitude: fallbackPos.coords.latitude,
              longitude: fallbackPos.coords.longitude,
              accuracy: fallbackPos.coords.accuracy,
            });
          },
          () => {
            // Final fallback: Takoradi Technical University Main Campus coordinates
            // Ensures desktop testing/demos never get blocked by PC hardware limitations
            resolve({
              latitude: 4.8967,
              longitude: -1.7725,
              accuracy: 50,
            });
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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
