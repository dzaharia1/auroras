// Heliographic coordinate mapping for the 2D solar disk view.
// Uses orthographic projection from heliographic (lat, lon) to image pixels.
// Assumes the image is a Helioviewer takeScreenshot at standard scale.

// Constants for the standard 1024x1024 Helioviewer screenshot
// at imageScale = 2.4204409 arcsec/pixel
// Sun angular radius ≈ 960 arcsec → 960 / 2.4204409 ≈ 396.6 pixels
export const SUN_IMAGE_PARAMS = {
  width: 1024,
  height: 1024,
  centerX: 512,
  centerY: 512,
  radiusPx: 396.6,
  imageScale: 2.4204409,
  sunAngularRadiusArcsec: 960,
};

/**
 * Convert heliographic coordinates to pixel position on the solar disk image.
 *
 * Uses orthographic projection (Earth-facing view):
 *   x = centerX - R * cos(lat) * sin(lon)
 *   y = centerY - R * sin(lat)
 *   visible = cos(lat) * cos(lon) > 0
 *
 * Coordinate convention (Stonyhurst heliographic):
 *   lat: degrees, positive = north (up in image)
 *   lon: degrees, negative = west
 *
 * In standard solar images (SDO/AIA, as viewed from Earth):
 *   Solar North = up, Solar West = right.
 *   SWPC uses negative longitude for West. sin(negative) is negative,
 *   so we NEGATE the term to place West on the right (larger x).
 *
 * @param {number} lat - Heliographic latitude in degrees
 * @param {number} lon - Heliographic longitude in degrees (negative = west)
 * @param {object} [imageParams] - Optional override of SUN_IMAGE_PARAMS
 * @returns {{ x: number, y: number, visible: boolean }}
 */
export function heliographicToPixel(lat, lon, imageParams = SUN_IMAGE_PARAMS) {
  const { centerX, centerY, radiusPx } = imageParams;
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  // Negate the longitude term: West (negative lon) must appear on the RIGHT
  const x = centerX - radiusPx * Math.cos(latRad) * Math.sin(lonRad);
  const y = centerY - radiusPx * Math.sin(latRad);
  const visible = Math.cos(latRad) * Math.cos(lonRad) > 0;

  return { x, y, visible };
}

/**
 * Parse a SWPC location string (e.g., "N16W60", "S24E28") into
 * heliographic lat/lon degrees.
 *
 * Convention:
 *   N = positive latitude, S = negative latitude
 *   E = positive longitude, W = negative longitude
 *
 * @param {string} location - SWPC location string
 * @returns {{ lat: number, lon: number } | null}
 */
export function parseLocationString(location) {
  if (!location || typeof location !== 'string') return null;
  const m = location.match(/^([NS])([\d.]+)([EW])([\d.]+)$/i);
  if (!m) return null;

  const lat = (m[1].toUpperCase() === 'N' ? 1 : -1) * parseFloat(m[2]);
  const lon = (m[3].toUpperCase() === 'E' ? 1 : -1) * parseFloat(m[4]);
  return { lat, lon };
}

/**
 * Scale pixel coordinates from the original 1024x1024 image space
 * to the actual rendered container dimensions.
 *
 * @param {number} x - Pixel x in image space
 * @param {number} y - Pixel y in image space
 * @param {number} containerWidth - Actual rendered width in CSS pixels
 * @param {number} containerHeight - Actual rendered height in CSS pixels
 * @param {object} [imageParams] - Optional override of SUN_IMAGE_PARAMS
 * @returns {{ x: number, y: number }}
 */
export function scaleToContainer(
  x,
  y,
  containerWidth,
  containerHeight,
  imageParams = SUN_IMAGE_PARAMS,
) {
  const scaleX = containerWidth / imageParams.width;
  const scaleY = containerHeight / imageParams.height;
  return { x: x * scaleX, y: y * scaleY };
}
