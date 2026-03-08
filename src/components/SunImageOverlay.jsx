import PropTypes from 'prop-types';
import { heliographicToPixel, SUN_IMAGE_PARAMS } from '../utils/solarCoords';

// Minimum outline radius for very small active regions
const MIN_REGION_RADIUS = 24;
const MAX_REGION_RADIUS = 60;

function regionRadius(area) {
  if (!area) return MIN_REGION_RADIUS;
  // area in millionths of solar hemisphere; scale to pixel radius
  const r = Math.sqrt(area / Math.PI) * 0.8;
  return Math.max(MIN_REGION_RADIUS, Math.min(MAX_REGION_RADIUS, r));
}

function ActiveRegionMarker({ region, scaleX, scaleY }) {
  const { latitude, longitude, region: arNum, magClass } = region;
  if (latitude == null || longitude == null) return null;

  const { x, y, visible } = heliographicToPixel(
    latitude,
    longitude,
    SUN_IMAGE_PARAMS,
  );
  if (!visible) return null;

  const px = x * scaleX;
  const py = y * scaleY;
  const r = regionRadius(region.area) * Math.min(scaleX, scaleY);
  const labelY = py - r - 4;

  const strokeColor = 'rgba(255, 200, 60, 0.8)';
  const fillColor = 'rgba(255, 200, 60, 0.06)';
  const label = `AR ${arNum}${magClass ? ` (${magClass})` : ''}`;

  return (
    <g>
      <circle
        cx={px}
        cy={py}
        r={r}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text
        x={px}
        y={labelY}
        textAnchor="middle"
        fill="rgba(255, 200, 60, 0.9)"
        fontSize={Math.max(9, 11 * Math.min(scaleX, scaleY))}
        fontFamily="monospace"
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {label}
      </text>
    </g>
  );
}

ActiveRegionMarker.propTypes = {
  region: PropTypes.object.isRequired,
  scaleX: PropTypes.number.isRequired,
  scaleY: PropTypes.number.isRequired,
};

function ProminenceMarker({ event, scaleX, scaleY }) {
  const { latitude, longitude, type, beginTime } = event;
  if (latitude == null || longitude == null) return null;

  const { x, y } = heliographicToPixel(latitude, longitude, SUN_IMAGE_PARAMS);
  const px = x * scaleX;
  const py = y * scaleY;

  const isLimb = type === 'EPL';
  const r = (isLimb ? 22 : 18) * Math.min(scaleX, scaleY);
  const date = beginTime ? beginTime.slice(0, 10) : '';

  const strokeColor = isLimb
    ? 'rgba(80, 200, 255, 0.8)'
    : 'rgba(150, 200, 255, 0.7)';
  const fillColor = isLimb
    ? 'rgba(80, 200, 255, 0.06)'
    : 'rgba(150, 200, 255, 0.05)';

  // EPL (prominence on limb): arc-shaped bracket
  // DSF/FIL (filament on disk): dashed circle
  if (isLimb) {
    const cx = SUN_IMAGE_PARAMS.centerX * scaleX;
    const cy = SUN_IMAGE_PARAMS.centerY * scaleY;
    const distFromCenter = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    const angle = Math.atan2(py - cy, px - cx);
    const arcHalf = 0.4; // radians
    const outerR = distFromCenter + r;
    const x1 = cx + outerR * Math.cos(angle - arcHalf);
    const y1 = cy + outerR * Math.sin(angle - arcHalf);
    const x2 = cx + outerR * Math.cos(angle + arcHalf);
    const y2 = cy + outerR * Math.sin(angle + arcHalf);
    return (
      <g>
        <path
          d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeDasharray="5 3"
        />
        <text
          x={(x1 + x2) / 2 + Math.cos(angle) * 14}
          y={(y1 + y2) / 2 + Math.sin(angle) * 14}
          textAnchor="middle"
          fill="rgba(80, 200, 255, 0.85)"
          fontSize={Math.max(8, 10 * Math.min(scaleX, scaleY))}
          fontFamily="monospace"
          style={{ pointerEvents: 'none', userSelect: 'none' }}>
          EPL {date}
        </text>
      </g>
    );
  }

  const typeLabel = type === 'DSF' ? 'DSF' : 'FIL';
  return (
    <g>
      <circle
        cx={px}
        cy={py}
        r={r}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      <text
        x={px}
        y={py - r - 4}
        textAnchor="middle"
        fill="rgba(150, 200, 255, 0.85)"
        fontSize={Math.max(8, 10 * Math.min(scaleX, scaleY))}
        fontFamily="monospace"
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {typeLabel} {date}
      </text>
    </g>
  );
}

ProminenceMarker.propTypes = {
  event: PropTypes.object.isRequired,
  scaleX: PropTypes.number.isRequired,
  scaleY: PropTypes.number.isRequired,
};

export default function SunImageOverlay({
  regions,
  events,
  showRegions,
  showProminences,
  containerWidth,
  containerHeight,
}) {
  const scaleX = containerWidth / SUN_IMAGE_PARAMS.width;
  const scaleY = containerHeight / SUN_IMAGE_PARAMS.height;

  if (!containerWidth || !containerHeight) return null;

  return (
    <svg
      width={containerWidth}
      height={containerHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}>
      <g transform="translate(0, -30)">
        {showRegions && regions.length === 0 && (
          <text
            x={containerWidth / 2}
            y={containerHeight - 40}
            textAnchor="middle"
            fill="rgba(255, 200, 60, 0.5)"
            fontSize={11}
            fontFamily="monospace">
            No active regions currently reported
          </text>
        )}

        {showRegions &&
          regions.map((r) => (
            <ActiveRegionMarker
              key={r.region}
              region={r}
              scaleX={scaleX}
              scaleY={scaleY}
            />
          ))}

        {showProminences &&
          events.map((e, i) => (
            <ProminenceMarker key={i} event={e} scaleX={scaleX} scaleY={scaleY} />
          ))}
      </g>
    </svg>
  );
}

SunImageOverlay.propTypes = {
  regions: PropTypes.arrayOf(PropTypes.object).isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  showRegions: PropTypes.bool,
  showProminences: PropTypes.bool,
  containerWidth: PropTypes.number,
  containerHeight: PropTypes.number,
};
