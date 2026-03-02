import { useRef, useMemo, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';

const MAX_INSTANCES = 9000;
const EARTH_RADIUS = 18;

// Simplex noise GLSL
const NOISE_GLSL = `
  vec3 mod289_3(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289_2(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute3(vec3 x) { return mod289_3(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1  = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289_2(i);
    vec3 p = permute3(permute3(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x2 = 2.0*fract(p * C.www) - 1.0;
    vec3 h = abs(x2) - 0.5;
    vec3 ox = floor(x2 + 0.5);
    vec3 a0 = x2 - ox;
    m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x *x0.x  + h.x *x0.y;
    g.yz = a0.yz*x12.xz + h.yz*x12.yw;
    return 130.0 * dot(m, g);
  }
`;

function populateMesh(mesh, coords, earthRadius) {
  if (!mesh || !coords || coords.length === 0) {
    if (mesh) mesh.count = 0;
    return;
  }

  // Filter: northern aurora oval zone, meaningful probability
  const filtered = coords.filter(([, lat, val]) => lat >= 45 && val >= 5);
  console.log(
    '[Aurora] coords:',
    coords.length,
    '| north+filtered:',
    filtered.length,
  );

  if (filtered.length === 0) {
    mesh.count = 0;
    return;
  }

  const count = Math.min(filtered.length, MAX_INSTANCES);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const up = new THREE.Vector3(0, 1, 0);

  // Per-instance color is stored as a plain geometry attribute (InstancedBufferAttribute).
  // This bypasses THREE.js's USE_INSTANCING_COLOR shader define entirely, which was
  // unreliable in production because the define is only injected at shader compile time
  // when mesh.instanceColor is already non-null — a race that fails when textures are
  // served from Cloudflare's cache and the mesh mounts before API data arrives.
  const colorAttr = mesh.geometry.getAttribute('auroraColor');

  for (let i = 0; i < count; i++) {
    const [lon, lat, val] = filtered[i];

    // Spherical → Cartesian (Matching SphereGeometry mapping where Lon 0 is at +X)
    // Shift 120 degrees eastward for correct alignment
    const phi_map = Math.PI + ((lon + 65) * Math.PI) / 180;
    const theta_map = ((90 - lat) * Math.PI) / 180;

    const x = -earthRadius * Math.sin(theta_map) * Math.cos(phi_map);
    const y = earthRadius * Math.cos(theta_map);
    const z = earthRadius * Math.sin(theta_map) * Math.sin(phi_map);

    // Orient plane so local Y points radially outward
    const normal = new THREE.Vector3(x, y, z).normalize();
    dummy.position.set(x, y, z);
    dummy.quaternion.setFromUnitVectors(up, normal);
    dummy.rotateOnWorldAxis(normal, Math.random() * Math.PI);

    const intensity = Math.min(val / 100, 1.0);
    const h = earthRadius * (0.06 + intensity * 0.19);
    const w = 0.3 + Math.random() * 0.6;
    dummy.scale.set(w, h, 1);

    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    // Green (low) → purple (high)
    color.setHSL(0.33 + intensity * 0.42, 1.0, 0.4 + intensity * 0.3);
    color.toArray(colorAttr.array, i * 3);
  }

  mesh.count = count;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceMatrix.needsUpdate = true;
  colorAttr.needsUpdate = true;

  console.log('[Aurora] rendered', count, 'curtains');
}

export default function AuroraCurtains({
  spaceWeather,
  earthRadius = EARTH_RADIUS,
}) {
  // Use a ref to store latest props so the callback ref can access them
  const propsRef = useRef({ spaceWeather, earthRadius });
  propsRef.current = { spaceWeather, earthRadius };

  const meshRef = useRef(null);

  // Callback ref: fires when the mesh mounts. Runs populateMesh immediately so
  // auroras appear right away if data is already available (e.g. from a cached response).
  const setMeshRef = useCallback((node) => {
    meshRef.current = node;
    if (node) {
      const { spaceWeather: sw, earthRadius: er } = propsRef.current;
      populateMesh(node, sw?.ovation?.coordinates, er);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-populate when data changes (mesh already exists at this point)
  useEffect(() => {
    populateMesh(
      meshRef.current,
      spaceWeather?.ovation?.coordinates,
      earthRadius,
    );
  }, [spaceWeather, earthRadius]);

  // Tall thin plane anchored at the bottom edge.
  // The 'auroraColor' InstancedBufferAttribute stores per-instance RGB color data.
  // Using a named geometry attribute instead of InstancedMesh.instanceColor avoids
  // THREE.js's USE_INSTANCING_COLOR define system, which requires the define to already
  // be present at shader compile time — something we cannot guarantee in production.
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, 1, 8);
    g.translate(0, 0.5, 0);
    g.setAttribute(
      'auroraColor',
      new THREE.InstancedBufferAttribute(
        new Float32Array(MAX_INSTANCES * 3),
        3,
      ),
    );
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
      ${NOISE_GLSL}
      attribute vec3 auroraColor;

      uniform float time;
      varying vec2 vUv;
      varying vec3 vColor;
      void main() {
        vUv = uv;
        vColor = auroraColor;
        vec3 pos = position;
        vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
        float wave = snoise(vec2(worldPos.x * 0.08 + time * 0.15, worldPos.z * 0.08));
        pos.x += wave * 1.5 * vUv.y;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
      }
    `,
        fragmentShader: `
      varying vec2 vUv;
      varying vec3 vColor;
      void main() {
        float edgeX = sin(vUv.x * 3.14159);
        float edgeY = 1.0 - smoothstep(0.3, 1.0, vUv.y);
        float alpha = edgeX * edgeY * 0.05;
        gl_FragColor = vec4(vColor * 1.2, alpha);
      }
    `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useFrame((state) => {
    if (material) material.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <instancedMesh
      ref={setMeshRef}
      args={[geometry, material, MAX_INSTANCES]}
      frustumCulled={false}
    />
  );
}

AuroraCurtains.propTypes = {
  spaceWeather: PropTypes.shape({
    ovation: PropTypes.shape({
      coordinates: PropTypes.array,
    }),
  }),
  earthRadius: PropTypes.number,
};
