/**
 * Generates synthetic OVATION-format coordinates simulating a severe geomagnetic storm (G4–G5).
 * Returns an array of [longitude, latitude, value] tuples matching the real API format.
 *
 * During a real G5 storm, aurora can be seen as far south as 40° latitude.
 * The auroral oval thickens, intensifies (values 60–100), and extends equatorward.
 */
export function generateStormOvation() {
  const coords = [];

  // Dense, highly active oval band (core aurora zone)
  for (let lon = 0; lon < 360; lon += 1) {
    for (let lat = 55; lat <= 75; lat += 1) {
      // Oval shape: peak intensity at ~65° lat, falling off toward edges
      const latOffset = Math.abs(lat - 65); // 0 at peak, 10 at edge
      const baseProbability = 90 - latOffset * 5; // 90 at 65°, 40 at edges

      // Add sinusoidal variation with longitude — aurora isn't uniform around the globe,
      // it's brighter on the night side (roughly lon 90–270 in this simplified model)
      const nightSideFactor = 0.5 + 0.5 * Math.cos(((lon - 180) * Math.PI) / 180);
      const value = Math.round(baseProbability * (0.5 + 0.5 * nightSideFactor));

      if (value > 5) coords.push([lon, lat, Math.min(value, 100)]);
    }
  }

  // Extended equatorward reach during extreme storm (G4-G5 signature)
  for (let lon = 0; lon < 360; lon += 2) {
    for (let lat = 40; lat < 55; lat += 1) {
      const nightSideFactor = 0.5 + 0.5 * Math.cos(((lon - 180) * Math.PI) / 180);
      // Weaker values at low lat — only visible during extreme storms
      const value = Math.round(25 * nightSideFactor * ((lat - 38) / 17));
      if (value > 5) coords.push([lon, lat, value]);
    }
  }

  return coords;
}

/** G1–G2 substorm: tight polar cap, moderate intensity */
export function generateSubstormOvation() {
  const coords = [];

  for (let lon = 0; lon < 360; lon += 1) {
    for (let lat = 62; lat <= 72; lat += 1) {
      const latOffset = Math.abs(lat - 67);
      const baseProbability = 60 - latOffset * 6;
      const nightSideFactor = 0.5 + 0.5 * Math.cos(((lon - 200) * Math.PI) / 180);
      const value = Math.round(baseProbability * (0.4 + 0.6 * nightSideFactor));
      if (value > 5) coords.push([lon, lat, Math.min(value, 100)]);
    }
  }

  return coords;
}
