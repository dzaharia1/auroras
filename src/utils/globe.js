/**
 * Globe coordinate system authority
 *
 * Reference point: NASA Blue Marble texture edges (u=0 and u=1) are at longitude ±180°
 * (the International Date Line). Three.js SphereGeometry places this UV seam at the -X axis (phi=0).
 *
 * Geographic lon → UV u → 3D axis:
 *   0°  (Prime Meridian) → u=0.5  → +X
 *   90°E                 → u=0.75 → −Z
 *   ±180° (Date Line)    → u=0/1  → −X  (seam)
 *   90°W                 → u=0.25 → +Z
 *
 * Canonical formula (lon in degrees −180..180, lat in degrees −90..90):
 *   phi   = PI + (lon * PI / 180)   → lon 0° → phi=PI → +X axis
 *   theta = (90 − lat) * PI / 180
 *   x = −sin(theta) * cos(phi)
 *   y =  cos(theta)
 *   z =  sin(theta) * sin(phi)
 */

import * as THREE from 'three';

/**
 * Converts geographic lon/lat to a 3D position on the sphere.
 * @param {number} lon - longitude in degrees, −180..180
 * @param {number} lat - latitude in degrees, −90..90
 * @param {number} [radius=1] - sphere radius
 * @returns {THREE.Vector3}
 */
export function lonLatToWorld(lon, lat, radius = 1) {
  const phi = Math.PI + (lon * Math.PI) / 180;
  const theta = ((90 - lat) * Math.PI) / 180;
  return new THREE.Vector3(
    -Math.sin(theta) * Math.cos(phi) * radius,
    Math.cos(theta) * radius,
    Math.sin(theta) * Math.sin(phi) * radius,
  );
}

/**
 * Converts NOAA OVATION 0–360 longitude to geographic −180..180.
 * @param {number} ovationLon - OVATION longitude 0..360
 * @returns {number} geographic longitude −180..180
 */
export function ovationLonToGeo(ovationLon) {
  return ovationLon > 180 ? ovationLon - 360 : ovationLon;
}

/**
 * Calculates the direction to the Sun in the Earth's local coordinate space.
 * Subsolar longitude: at UTC noon (12:00) the sun is directly over lon 0° (Prime Meridian).
 * Every hour shifts the subsolar point 15° west.
 * @param {Date} date
 * @returns {THREE.Vector3} unit vector toward the sun
 */
export function getSubsolarVector(date) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24,
  );

  // Solar declination (axial tilt effect)
  const declinationRad =
    ((23.44 * Math.PI) / 180) *
    Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);

  const utcHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;

  // At UTC 12:00 the sun is at lon 0°; each hour = 15° westward
  const subSolarLon = (12 - utcHours) * 15;

  return lonLatToWorld(subSolarLon, (declinationRad * 180) / Math.PI).normalize();
}

/** IGRF 2025 geomagnetic north pole */
export const MAG_NORTH = { lon: -72.7, lat: 80.7 };

/**
 * Returns a unit vector toward the geomagnetic north pole.
 * @returns {THREE.Vector3}
 */
export function getMagNorthVector() {
  return lonLatToWorld(MAG_NORTH.lon, MAG_NORTH.lat).normalize();
}
