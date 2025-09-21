/**
 * Utility functions for handling trajectory data
 */

/**
 * Detects if coordinates are in [lat, lng] or [lng, lat] format
 * @param {Array} coordinates - Array of coordinate pairs
 * @returns {string} - 'lat-lng' or 'lng-lat'
 */
export function detectCoordinateFormat(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return 'lng-lat'; // default
  }

  // Sample first few coordinates to determine format
  const sampleSize = Math.min(10, coordinates.length);
  let latFirstCount = 0;
  let lngFirstCount = 0;

  for (let i = 0; i < sampleSize; i++) {
    const coord = coordinates[i];
    if (!Array.isArray(coord) || coord.length < 2) continue;

    const first = coord[0];
    const second = coord[1];

    // Check if first value is likely latitude (between -90 and 90)
    // and second value is likely longitude (between -180 and 180, often larger absolute values)
    if (Math.abs(first) <= 90 && Math.abs(second) <= 180) {
      if (Math.abs(second) > Math.abs(first) || Math.abs(second) > 90) {
        latFirstCount++;
      } else {
        lngFirstCount++;
      }
    }
  }

  // If most coordinates suggest lat-first format, return that
  return latFirstCount > lngFirstCount ? 'lat-lng' : 'lng-lat';
}

/**
 * Normalizes trajectory data to [longitude, latitude] format
 * @param {Array} trajectoryData - Array of coordinate pairs
 * @returns {Array} - Normalized coordinates in [lng, lat] format
 */
export function normalizeTrajectoryData(trajectoryData) {
  if (!Array.isArray(trajectoryData) || trajectoryData.length === 0) {
    return [];
  }

  // Detect the format
  const format = detectCoordinateFormat(trajectoryData);

  console.log('Detected coordinate format:', format);
  console.log('Sample coordinates:', trajectoryData.slice(0, 3));

  // If already in lng-lat format, return as is
  if (format === 'lng-lat') {
    return trajectoryData;
  }

  // Convert from lat-lng to lng-lat
  const normalized = trajectoryData.map(coord => {
    if (!Array.isArray(coord) || coord.length < 2) {
      console.warn('Invalid coordinate:', coord);
      return coord;
    }
    return [coord[1], coord[0]]; // swap lat,lng to lng,lat
  });

  console.log('Normalized coordinates:', normalized.slice(0, 3));
  return normalized;
}

/**
 * Validates trajectory data format
 * @param {Array} trajectoryData - Array of coordinate pairs
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateTrajectoryData(trajectoryData) {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!Array.isArray(trajectoryData)) {
    result.isValid = false;
    result.errors.push('Trajectory data must be an array');
    return result;
  }

  if (trajectoryData.length === 0) {
    result.isValid = false;
    result.errors.push('Trajectory data cannot be empty');
    return result;
  }

  // Check each coordinate
  trajectoryData.forEach((coord, index) => {
    if (!Array.isArray(coord)) {
      result.errors.push(`Coordinate at index ${index} is not an array`);
      result.isValid = false;
      return;
    }

    if (coord.length < 2) {
      result.errors.push(`Coordinate at index ${index} must have at least 2 values`);
      result.isValid = false;
      return;
    }

    const [first, second] = coord;

    if (typeof first !== 'number' || typeof second !== 'number') {
      result.errors.push(`Coordinate at index ${index} contains non-numeric values`);
      result.isValid = false;
      return;
    }

    if (isNaN(first) || isNaN(second)) {
      result.errors.push(`Coordinate at index ${index} contains NaN values`);
      result.isValid = false;
      return;
    }

    // Check for reasonable coordinate ranges (after normalization)
    const normalized = normalizeTrajectoryData([coord])[0];
    const [lng, lat] = normalized;

    if (Math.abs(lng) > 180) {
      result.warnings.push(`Longitude at index ${index} (${lng}) is outside valid range (-180 to 180)`);
    }

    if (Math.abs(lat) > 90) {
      result.warnings.push(`Latitude at index ${index} (${lat}) is outside valid range (-90 to 90)`);
    }
  });

  return result;
}