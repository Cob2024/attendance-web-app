import { calculateDistanceMeters } from '../utils/haversine.js';

describe('Haversine Distance Calculation', () => {
  test('should return 0 for identical coordinates', () => {
    const distance = calculateDistanceMeters(4.8925, -1.7554, 4.8925, -1.7554);
    expect(distance).toBe(0);
  });

  test('should calculate correct distance between two known points', () => {
    // TTU Main Campus to TTU Library (approx 200m)
    const distance = calculateDistanceMeters(4.8925, -1.7554, 4.8940, -1.7548);
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(300);
  });

  test('should return distance within 50m for nearby coordinates', () => {
    // Two points ~30m apart
    const distance = calculateDistanceMeters(4.8925, -1.7554, 4.89265, -1.75535);
    expect(distance).toBeLessThan(50);
  });

  test('should return large distance for far-apart coordinates', () => {
    // Takoradi to Accra (~200km)
    const distance = calculateDistanceMeters(4.8925, -1.7554, 5.6037, -0.1870);
    expect(distance).toBeGreaterThan(150000); // > 150km
    expect(distance).toBeLessThan(250000); // < 250km
  });

  test('should handle negative coordinates', () => {
    const distance = calculateDistanceMeters(-33.8688, 151.2093, -34.0522, 151.2437);
    expect(distance).toBeGreaterThan(15000); // Sydney area
    expect(distance).toBeLessThan(25000);
  });

  test('should be symmetric — distance(A,B) === distance(B,A)', () => {
    const distAB = calculateDistanceMeters(4.8925, -1.7554, 5.6037, -0.1870);
    const distBA = calculateDistanceMeters(5.6037, -0.1870, 4.8925, -1.7554);
    expect(distAB).toBe(distBA);
  });

  test('should always return a non-negative value', () => {
    const distance = calculateDistanceMeters(0, 0, 0, 0);
    expect(distance).toBeGreaterThanOrEqual(0);
  });
});
