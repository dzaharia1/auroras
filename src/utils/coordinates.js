import * as THREE from 'three';

// Standard Three.js SphereGeometry mapping coordinates:
// NASA Blue Marble Next Generation textures have Prime Meridian (Lon 0) at the exact center (u=0.5).
// The left edge is Lon -180, and the right edge is Lon 180.
// In Three.js, u=0.5 (Lon 0) is at +X. u=0.75 (Lon 90E) is at -Z.
// Formula: phi = PI + lonRad (where lonRad is the angle from the prime meridian)

/**
 * Converts geographic coordinates (longitude and latitude) to a Three.js Vector3.
 *
 * @param {number} lon - Longitude in degrees (-180 to 180 or 0 to 360).
 * @param {number} lat - Latitude in degrees (-90 to 90).
 * @param {number} radius - The radius of the sphere (defaults to 1).
 * @returns {THREE.Vector3} The 3D Cartesian coordinates.
 */
export function getPositionFromLatLon(lon, lat, radius = 1) {
    // Normalize longitude to -180 to 180
    let normalizedLon = lon;
    if (normalizedLon > 180) {
        normalizedLon -= 360;
    }

    const phi = Math.PI + (normalizedLon * Math.PI) / 180;
    const theta = ((90 - lat) * Math.PI) / 180;

    const x = -radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.cos(theta);
    const z = radius * Math.sin(theta) * Math.sin(phi);

    return new THREE.Vector3(x, y, z);
}

/**
 * Calculates the direction to the Sun in the Earth's local coordinate space based on UTC time.
 *
 * @param {Date} date - The current UTC date/time.
 * @returns {THREE.Vector3} The normalized direction vector pointing to the Sun.
 */
export function getSubsolarVector(date) {
    const dayOfYear = Math.floor(
        (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    );
    // Solar declination (tilt relative to equator)
    const declinationDeg = 23.44 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);

    const timeHours =
        date.getUTCHours() +
        date.getUTCMinutes() / 60 +
        date.getUTCSeconds() / 3600;

    // Calculate longitude where sun is overhead. Noon UTC (12:00) is Lon 0.
    const sunLonDeg = (12 - timeHours) * 15;

    // The subsolar point is essentially where the sun is directly overhead (zenith).
    // The direction to the sun is the normalized vector to the subsolar point.
    return getPositionFromLatLon(sunLonDeg, declinationDeg, 1).normalize();
}

/**
 * Returns the normalized Vector3 representing the Magnetic North Pole.
 *
 * @returns {THREE.Vector3} The normalized vector pointing to the Magnetic North Pole.
 */
export function getMagneticNorthPole() {
    // Magnetic North Pole coordinates (~80.7°N, 72.7°W)
    return getPositionFromLatLon(-72.7, 80.7, 1).normalize();
}
