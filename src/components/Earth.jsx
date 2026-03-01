import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import AuroraCurtains from './AuroraCurtains';

// Calculates the direction to the Sun in the Earth's local coordinate space based on UTC time
function getSubsolarVector(date) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24,
  );
  // Solar declination (tilt relative to equator)
  const declinationRad =
    ((23.44 * Math.PI) / 180) *
    Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);
  const timeHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;

  // Calculate longitude where sun is overhead. Noon UTC (12:00) is Lon 0.
  // We subtract 1 to nudge the terminator ~15 degrees West for better visual alignment.
  const lonRad = ((11 - timeHours) * 15 * Math.PI) / 180;

  // Standard Three.js SphereGeometry mapping coordinates:
  // u=0.5 (Lon 0) is at +X. u=0.75 (Lon 90E) is at -Z.
  // Formula: phi = PI + lonRad
  const theta = Math.PI / 2 - declinationRad;
  const phi = Math.PI + lonRad;

  const x = -Math.sin(theta) * Math.cos(phi);
  const y = Math.cos(theta);
  const z = Math.sin(theta) * Math.sin(phi);

  return new THREE.Vector3(x, y, z).normalize();
}

export default function Earth({ position, spaceWeather, autoRotate }) {
  const groupRef = useRef();
  const earthRef = useRef();
  const auroraRef = useRef();
  const { gl } = useThree();

  const [dayMap, nightMap] = useTexture([
    '/textures/earth_day.jpg',
    '/textures/earth_night.png',
  ]);

  // Use refs for drag state to avoid re-renders during mouse move
  const isDragging = useRef(false);
  const previousX = useRef(0);
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
                float intensity = dot(normalize(vNormalLocal), sunDirection);
                
                // Blend day and night over a smooth terminator line
                float blend = smoothstep(-0.2, 0.2, intensity);
                
                // Boost the night map's city lights slightly
                vec3 finalColor = mix(nightColor * 1.5, dayColor, blend);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
          `,
    });
  }, [dayMap, nightMap]);

  useEffect(() => {
    const el = gl.domElement;

    const handleDown = (e) => {
      // Don't start drag if clicking on UI elements (buttons or overlay content)
      if (e.target.closest('button') || e.target.closest('.overlay-content'))
        return;

      isDragging.current = true;
      previousX.current = e.clientX;
      rotationVelocity.current = 0;

      // Capture the pointer to ensure events continue even if mouse leaves window
      el.setPointerCapture(e.pointerId);
      document.body.style.cursor = 'grabbing';
    };

    const handleUp = (e) => {
      isDragging.current = false;
      el.releasePointerCapture(e.pointerId);
      document.body.style.cursor = 'default';
    };

    const handleMove = (e) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousX.current;
      previousX.current = e.clientX;

      // Use a consistent screen-space rotation factor
      const factor = -(deltaX / window.innerWidth) * 3.14159 * 2.5;

      if (earthRef.current) earthRef.current.rotation.y += factor;
      if (auroraRef.current) auroraRef.current.rotation.y += factor;
      rotationVelocity.current = factor;
    };

    el.addEventListener('pointerdown', handleDown);
    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerup', handleUp);
    el.addEventListener('pointercancel', handleUp);

    return () => {
      el.removeEventListener('pointerdown', handleDown);
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerup', handleUp);
      el.removeEventListener('pointercancel', handleUp);
      document.body.style.cursor = 'default';
    };
  }, [gl]);

  useFrame(() => {
    // Dynamically update the position of the sun on the globe based on the exact real-world UTC time!
    if (earthMaterial) {
      earthMaterial.uniforms.sunDirection.value.copy(
        getSubsolarVector(new Date()),
      );
    }

    if (earthRef.current && !isDragging.current) {
      const step = rotationVelocity.current;
      earthRef.current.rotation.y += step;
      if (auroraRef.current) auroraRef.current.rotation.y += step;

      rotationVelocity.current *= 0.95;
      if (Math.abs(rotationVelocity.current) < 0.001 && autoRotate) {
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
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[18, 64, 64]} />
      </mesh>

      {/* Real-time 3D OVATION Aurora Curtains */}
      <group ref={auroraRef}>
        <AuroraCurtains spaceWeather={spaceWeather} earthRadius={18.0} />
      </group>
    </group>
  );
}
