import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import AuroraCurtains from './AuroraCurtains';
import { getSubsolarVector, getMagNorthVector } from '../utils/globe';

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
  stormMode,
  currentDate,
}) {
  const groupRef = useRef();
  const auroraRef = useRef();
  const auroraOffsetRef = useRef();
  const { gl } = useThree();

  const seasonalMaps = useTexture(MONTHS.map((m) => `/textures/day_${m}.jpg`));
  const [nightMap] = useTexture(['/textures/earth_night.png']);

  // Use refs for drag state to avoid re-renders during mouse move
  const isDragging = useRef(false);
  const dragPointerIdRef = useRef(null);
  const activePointerCountRef = useRef(0);
  const previousX = useRef(0);
  const previousY = useRef(0);
  const velocityX = useRef(0);
  const velocityY = useRef(0);

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
      if (e.target.closest('button') || e.target.closest('.overlay-content'))
        return;

      activePointerCountRef.current += 1;

      // Second finger = pinch gesture; cancel drag rotation to prevent wild spinning
      if (activePointerCountRef.current > 1) {
        isDragging.current = false;
        if (dragPointerIdRef.current !== null) {
          try { el.releasePointerCapture(dragPointerIdRef.current); } catch (_) {}
          dragPointerIdRef.current = null;
        }
        velocityX.current = 0;
        velocityY.current = 0;
        return;
      }

      isDragging.current = true;
      dragPointerIdRef.current = e.pointerId;
      previousX.current = e.clientX;
      previousY.current = e.clientY;
      velocityX.current = 0;
      velocityY.current = 0;

      el.setPointerCapture(e.pointerId);
      document.body.style.cursor = 'grabbing';
    };

    const handleUp = (e) => {
      activePointerCountRef.current = Math.max(0, activePointerCountRef.current - 1);
      if (e.pointerId === dragPointerIdRef.current) {
        isDragging.current = false;
        dragPointerIdRef.current = null;
        try { el.releasePointerCapture(e.pointerId); } catch (_) {}
        document.body.style.cursor = 'default';
      }
    };

    const handleMove = (e) => {
      if (!isDragging.current || e.pointerId !== dragPointerIdRef.current) return;

      const deltaX = e.clientX - previousX.current;
      const deltaY = e.clientY - previousY.current;
      previousX.current = e.clientX;
      previousY.current = e.clientY;

      const fx = (deltaX / window.innerWidth) * Math.PI * 2.5;
      const fy = (deltaY / window.innerHeight) * Math.PI * 2.5;

      if (groupRef.current) {
        const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), fx);
        const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), fy);
        groupRef.current.quaternion.premultiply(qY).premultiply(qX);
      }

      velocityX.current = fx;
      velocityY.current = fy;
    };

    el.addEventListener('pointerdown', handleDown);
    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerup', handleUp);
    el.addEventListener('pointercancel', (e) => {
      activePointerCountRef.current = Math.max(0, activePointerCountRef.current - 1);
      handleUp(e);
    });

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

    if (groupRef.current && !isDragging.current) {
      const vx = velocityX.current;
      const vy = velocityY.current;

      if (Math.abs(vx) > 0.0001 || Math.abs(vy) > 0.0001) {
        const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), vx);
        const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), vy);
        groupRef.current.quaternion.premultiply(qY).premultiply(qX);
        velocityX.current *= 0.95;
        velocityY.current *= 0.95;
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
        const magVector = getMagNorthVector();

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
      <mesh>
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
};
