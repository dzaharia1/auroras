import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SpaceWeatherStream({
  sunPosition,
  earthPosition,
  spaceWeather,
}) {
  const pointsRef = useRef();

  const { solarWind, loading } = spaceWeather;

  // Defaults for loading/error states
  const speed = loading || !solarWind ? 400 : solarWind.speed;
  const density = loading || !solarWind ? 5 : solarWind.density;
  const bz = loading || !solarWind ? 0 : solarWind.bz;

  // Determine color based on Bz. Negative Bz means Southward (favorable for auroras) -> we can make the stream more intense/reddish.
  const streamColor = useMemo(() => {
    const c = new THREE.Color('#ffffaa');
    if (bz < -2)
      c.lerp(new THREE.Color('#ff5500'), Math.min(1, Math.abs(bz) / 10)); // Redder for negative Bz
    return c;
  }, [bz]);

  const particleCount = useMemo(() => {
    // Map density (e.g. 1 - 20) to particle count (e.g. 100 - 2000)
    return Math.floor(Math.max(100, Math.min(3000, density * 100)));
  }, [density]);

  // The visible gap is roughly between Y=3 (bottom of Sun) and Y=-3 (top of Earth)
  const startY = sunPosition[1] - 16; // 20 - 16 = 4. Start flowing from just inside the Sun's visual bounds.
  const yRange = startY - (earthPosition[1] + 16); // Distance between startY(4) and endY(-4) = 8

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const phs = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      // Initial random positions within a cylinder between sun and earth
      const angle = Math.random() * Math.PI * 2;
      // spread increases as it gets closer to earth (bow shock effect)
      const radius = Math.random() * 2 + 1;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = startY - Math.random() * yRange;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      phs[i] = Math.random() * 10; // Random phase for horizontal drift
    }
    return [pos, phs];
  }, [particleCount, startY, yRange]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Map solar wind speed (e.g. 300 - 800) to actual animation delta
    const normalizedSpeed = (speed / 400) * 15; // baseline speed multiplier
    const moveY = delta * normalizedSpeed;

    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const posArray = positionsAttr.array;

    for (let i = 0; i < particleCount; i++) {
      // move down Y axis
      posArray[i * 3 + 1] -= moveY;

      // add some horizontal waving based on phase
      phases[i] += delta * 2;
      const wave = Math.sin(phases[i]) * 0.05 * (speed / 400);
      posArray[i * 3] += wave;

      // Reset to top if it reaches Earth (Earth is at -20, radius 18, so surface is around -2)
      if (posArray[i * 3 + 1] < earthPosition[1] + 16) {
        posArray[i * 3 + 1] = startY - Math.random(); // Start just below sun
        // reset X/Z to cylinder
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 2 + 1;
        posArray[i * 3] = Math.cos(angle) * radius;
        posArray[i * 3 + 2] = Math.sin(angle) * radius;
      }
    }

    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} key={particleCount}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={streamColor}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
