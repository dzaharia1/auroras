import * as THREE from 'three';

/**
 * Converts Geographic coordinates (Latitude, Longitude) to 3D Cartesian coordinates.
 * This function serves as the single source of truth for all spatial alignment in the app.
 * 
 * Reference Coordinate System:
 * - Earth texture uses NASA Blue Marble (Equirectangular projection).
 * - Left edge (u=0) is 180°W (Antimeridian).
 * - Center (u=0.5) is 0° (Prime Meridian).
 * - Right edge (u=1.0) is 180°E.
 * 
 * In Three.js SphereGeometry:
 * - u=0.5 maps to +X axis.
 * - +Z axis maps to 90°W (longitude -90).
 * - -Z axis maps to 90°E (longitude +90).
 *
 * @param {number} lat - Latitude in degrees (-90 to 90).
 * @param {number} lon - Longitude in degrees (-180 to 180, or 0 to 360).
 * @param {number} radius - Sphere radius.
 * @returns {THREE.Vector3} Cartesian coordinates.
 */
export function getPositionFromLatLon(lat, lon, radius = 1) {
  // Convert degrees to radians
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  // X points to Prime Meridian (0° Lon)
  // Y points to North Pole (90° Lat)
  // Z points to 90° West (-90° Lon)
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = -radius * Math.cos(latRad) * Math.sin(lonRad);

  return new THREE.Vector3(x, y, z);
}

/**
 * Calculates the direction of the Sun based on UTC date/time.
 * @param {Date} date - The date to calculate for.
 * @returns {THREE.Vector3} Normalized vector pointing to the sun.
 */
export function getSubsolarVector(date) {
  // Day of year calculation
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Solar declination (latitude of subsolar point)
  // Max ~23.44° at Summer Solstice (around day 172)
  const declination = 23.44 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);

  // Solar longitude: Earth rotates 15 degrees per hour.
  // At 12:00 UTC, the Sun is directly over the Prime Meridian (0° Lon).
  const timeHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const sunLon = (12 - timeHours) * 15;

  return getPositionFromLatLon(declination, sunLon).normalize();
}

/**
 * Gets the position of the Magnetic North Pole.
 * Currently at approximately 80.7° N, 72.7° W.
 * @param {number} radius - Sphere radius.
 * @returns {THREE.Vector3} Normalized vector pointing to magnetic north.
 */
export function getMagneticNorthVector(radius = 1) {
  return getPositionFromLatLon(80.7, -72.7, radius).normalize();
}
