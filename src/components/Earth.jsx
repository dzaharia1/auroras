import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import AuroraCurtains from './AuroraCurtains';

// Calculates the direction to the Sun in the Earth's local coordinate space based on UTC time
function getSubsolarVector(date) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24,
  );
  const declinationRad =
    ((23.44 * Math.PI) / 180) *
    Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);
  const timeHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;

  // 360 degrees in 24 hours. At 12:00 UTC, sun is at Lon 0.
  const lonDeg = (12 - timeHours) * 15;
  const lonRad = (lonDeg * Math.PI) / 180;

  // Convert standard geographic coordinates to Three.js SphereGeometry local Cartesian coordinates.
  // u=0.5 (Lon 0) maps to -Z, u=0.75 (Lon 90E) maps to +X
  const x = Math.cos(declinationRad) * Math.sin(lonRad);
  const y = Math.sin(declinationRad);
  const z = -Math.cos(declinationRad) * Math.cos(lonRad);

  return new THREE.Vector3(x, y, z).normalize();
}

export default function Earth({ position, spaceWeather }) {
  const groupRef = useRef();
  const earthRef = useRef();
  const auroraRef = useRef();
  const { viewport } = useThree();

  const [dayMap, nightMap] = useTexture([
    '/textures/earth_day.jpg',
    '/textures/earth_night.png',
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [previousX, setPreviousX] = useState(0);
  const rotationVelocity = useRef(0);
  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayMap },
        nightTexture: { value: nightMap },
        // Will be updated every frame based on the current time
        sunDirection: { value: new THREE.Vector3(0, 1, 0) },
      },
      vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormalLocal;
            void main() {
                vUv = uv;
                // Pass the UNMODIFIED local normal.
                // This locks the lighting to the geography of the sphere regardless of how the user spins the mesh!
                vNormalLocal = normalize(normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
      fragmentShader: `
            uniform sampler2D dayTexture;
            uniform sampler2D nightTexture;
            uniform vec3 sunDirection;
            varying vec2 vUv;
            varying vec3 vNormalLocal;

            void main() {
                vec3 dayColor = texture2D(dayTexture, vUv).rgb;
                vec3 nightColor = texture2D(nightTexture, vUv).rgb;
                
                // 1.0 = direct sunlight, -1.0 = pitch black night
                // FLIPPED sunDirection to fix day/night inversion bug
                float intensity = dot(normalize(vNormalLocal), -sunDirection);
                
                // Blend day and night over a smooth terminator line
                float blend = smoothstep(-0.2, 0.2, intensity);
                
                // Boost the night map's city lights slightly
                vec3 finalColor = mix(nightColor * 1.5, dayColor, blend);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
          `,
    });
  }, [dayMap, nightMap]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    setPreviousX(e.clientX);
    rotationVelocity.current = 0;
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousX;
    setPreviousX(e.clientX);
    const factor = -(deltaX / viewport.width) * 0.05;
    if (earthRef.current) earthRef.current.rotation.y += factor;
    if (auroraRef.current) auroraRef.current.rotation.y += factor;
    rotationVelocity.current = factor;
  };

  useFrame(() => {
    // Dynamically update the position of the sun on the globe based on the exact real-world UTC time!
    if (earthMaterial) {
      earthMaterial.uniforms.sunDirection.value.copy(
        getSubsolarVector(new Date()),
      );
    }

    if (earthRef.current && !isDragging) {
      const step = rotationVelocity.current;
      earthRef.current.rotation.y += step;
      if (auroraRef.current) auroraRef.current.rotation.y += step;

      rotationVelocity.current *= 0.95;
      if (Math.abs(rotationVelocity.current) < 0.001) {
        earthRef.current.rotation.y += 0.0005;
        if (auroraRef.current) auroraRef.current.rotation.y += 0.0005;
      }
    }
  });

  return (
    <group
      position={position}
      ref={groupRef}
      rotation={[0.6, 0, 0]} // Steeper tilt to emphasize north pole
    >
      <group
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerMove={handlePointerMove}>
        <mesh ref={earthRef} material={earthMaterial}>
          <sphereGeometry args={[18, 64, 64]} />
        </mesh>

        {/* Real-time 3D OVATION Aurora Curtains */}
        <group ref={auroraRef}>
          <AuroraCurtains spaceWeather={spaceWeather} earthRadius={18.0} />
        </group>
      </group>
    </group>
  );
}
