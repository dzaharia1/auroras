import PropTypes from 'prop-types';
import * as THREE from 'three';
import { useMemo } from 'react';

// Kp 0 = green, 5 = yellow, 9 = red (HSL interpolation)
function kpToColor(kp) {
  const t = Math.min(Math.max(parseFloat(kp) / 9, 0), 1);
  const hue = (1 - t) * 120; // 120° green → 0° red
  return new THREE.Color(`hsl(${Math.round(hue)}, 100%, 55%)`);
}

export default function KpLayer({ kp, position }) {
  const kpValue = kp?.estimatedKp ?? kp?.kp ?? 0;
  const color = useMemo(() => kpToColor(kpValue), [kpValue]);
  const opacity = Math.min(Math.max(kpValue / 9, 0.1), 0.8);

  return (
    <mesh position={position}>
      <torusGeometry args={[19.2, 0.15, 8, 120]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

KpLayer.propTypes = {
  kp: PropTypes.shape({
    kp: PropTypes.number,
    estimatedKp: PropTypes.number,
  }),
  position: PropTypes.arrayOf(PropTypes.number),
};
