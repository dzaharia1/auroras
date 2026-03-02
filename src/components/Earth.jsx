import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import AuroraCurtains from './AuroraCurtains';
import { getSubsolarVector, getMagneticNorthPole } from '../utils/coordinates';

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

export default function Earth({
  position,
  spaceWeather,
  autoRotate,
  stormMode,
  currentDate,
}) {
  const groupRef = useRef();
  const earthRef = useRef();
  const auroraRef = useRef();
  const auroraOffsetRef = useRef();
  const { gl } = useThree();

  const seasonalMaps = useTexture(MONTHS.map((m) => `/textures/day_${m}.jpg`));
  const [nightMap] = useTexture(['/textures/earth_night.png']);

  // Use refs for drag state to avoid re-renders during mouse move
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const rotationVelocity = useRef(0);

  const earthMaterial = useMemo(() => {
    const monthIndex = (currentDate || new Date()).getMonth();
    const dayMap = seasonalMaps[monthIndex];

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
  }, [currentDate, seasonalMaps, nightMap]);

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
      const factor = (deltaX / window.innerWidth) * 3.14159 * 2.5;

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
        getSubsolarVector(currentDate || new Date()),
      );
    }

    if (earthRef.current && !isDragging.current) {
      const step = rotationVelocity.current;
      earthRef.current.rotation.y += step;

      // Update basic aurora rotation (matching Earth spin)
      if (auroraRef.current) auroraRef.current.rotation.y += step;

      rotationVelocity.current *= 0.95;
      if (Math.abs(rotationVelocity.current) < 0.001 && autoRotate) {
        earthRef.current.rotation.y += 0.0005;
        if (auroraRef.current) auroraRef.current.rotation.y += 0.0005;
      }
    }

    // Handle aurora geographic/astronomical placement
    if (auroraRef.current && auroraOffsetRef.current) {
      if (stormMode === 'live') {
        // Live mode: Match geography exactly (already doing via rotation.y sync)
        auroraOffsetRef.current.rotation.set(0, 0, 0);
      } else {
        // Historical/Sim mode: Center on Magnetic North + Night-side stretch

        // 1. Magnetic North reference (Earth-relative)
        const magVector = getMagneticNorthPole();

        // 2. Magnetotail shift: push center equatorward away from subsolar point
        const sunVec = getSubsolarVector(currentDate || new Date());
        const antiSolarVec = sunVec.clone().negate();

        // Push the center towards the night side by ~5 degrees
        const shiftAngle = (5.0 * Math.PI) / 180;
        const dynamicCenter = magVector
          .clone()
          .add(antiSolarVec.multiplyScalar(Math.tan(shiftAngle)))
          .normalize();

        // 3. Orient the offset group to the dynamic center
        const up = new THREE.Vector3(0, 1, 0);
        const q = new THREE.Quaternion().setFromUnitVectors(up, dynamicCenter);
        auroraOffsetRef.current.quaternion.copy(q);

        // 4. Intensity Peak: Face the Night Side (Midnight sector)
        // Project anti-solar onto the local "Equator" plane of the shifted oval
        const localNight = antiSolarVec
          .clone()
          .projectOnPlane(dynamicCenter)
          .normalize();
        const localReference = new THREE.Vector3(0, 1, 0)
          .projectOnPlane(dynamicCenter)
          .normalize();

        // Lon 180 (peak) should align with localNight
        const angle = Math.atan2(
          localNight.clone().cross(localReference).dot(dynamicCenter),
          localNight.dot(localReference),
        );

        // Apply absolute spin rotation.
        // Re-adding + Math.PI to put the peak intensity on the night side.
        const spinQ = new THREE.Quaternion().setFromAxisAngle(
          up,
          angle + Math.PI,
        );
        auroraOffsetRef.current.quaternion.multiply(spinQ);
      }
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* Earth Mesh */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[18, 64, 64]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>

      {/* Aurora Group */}
      <group ref={auroraRef}>
        <group ref={auroraOffsetRef}>
          <AuroraCurtains spaceWeather={spaceWeather} earthRadius={18.0} />
        </group>
      </group>
    </group>
  );
}

Earth.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  currentDate: PropTypes.instanceOf(Date),
  stormMode: PropTypes.string,
  spaceWeather: PropTypes.shape({
    ovation: PropTypes.shape({
      coordinates: PropTypes.array,
    }),
  }),
  autoRotate: PropTypes.bool,
};
