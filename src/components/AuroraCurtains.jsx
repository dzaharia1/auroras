import { useRef, useMemo, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const MAX_INSTANCES = 5000;
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

  for (let i = 0; i < count; i++) {
    const [lon, lat, val] = filtered[i];

    // Spherical → Cartesian (Three.js Y-up)
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = earthRadius * Math.sin(phi) * Math.sin(theta);
    const y = earthRadius * Math.cos(phi);
    const z = -earthRadius * Math.sin(phi) * Math.cos(theta);

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
    mesh.setColorAt(i, color);
  }

  mesh.count = count;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  // Force shader recompile so Three.js picks up USE_INSTANCING_COLOR now that
  // the instanceColor buffer exists. Without this, the shader compiled on
  // frame 0 (before setColorAt was called) lacks the attribute and the
  // per-instance colors are silently ignored.
  if (mesh.material) mesh.material.needsUpdate = true;

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

  // Callback ref: fires when the mesh mounts AND whenever it changes.
  // This guarantees populateMesh is called as soon as the DOM node exists.
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

  // Tall thin plane anchored at the bottom edge
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, 1, 8);
    g.translate(0, 0.5, 0);
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
      ${NOISE_GLSL}
      uniform float time;
      varying vec2 vUv;
      varying vec3 vColor;
      void main() {
        vUv = uv;
        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(0.0, 0.8, 0.4); // fallback green until buffer is ready
        #endif
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
    />
  );
}
