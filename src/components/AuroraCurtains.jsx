import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// 2D Simplex Noise for extreme efficiency instead of 3D
const noiseShaderChunk = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1; i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ; m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

export default function AuroraCurtains({ spaceWeather, earthRadius }) {
  const meshRef = useRef();
  const maxInstances = 12000;

  // Guard against early renders crashing the ShaderMaterial
  const [isReady, setIsReady] = useState(false);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        ${noiseShaderChunk}
        
        // Bulletproof definitions depending on ThreeJS version
        #ifndef USE_INSTANCING
          attribute mat4 instanceMatrix;
        #endif
        #ifndef USE_INSTANCING_COLOR
          attribute vec3 instanceColor;
        #endif

        uniform float time;
        varying vec2 vUv;
        varying vec3 vColor;
        
        void main() {
          vUv = uv;
          #ifdef USE_INSTANCING_COLOR
            vColor = instanceColor; 
          #else
            vColor = vec3(0.0);
          #endif
          
          vec3 pos = position;
          
          vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
          
          float noiseFactor = snoise(vec2(worldPos.x * 2.0 + time, worldPos.z * 2.0));
          
          // Billow top of curtain sideways based on exact world coordinates
          pos.x += noiseFactor * 0.3 * vUv.y;
          
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vColor;
        
        void main() {
          // Soft fade out at top (y=1) and sharp fade at side edges (x=0, x=1)
          float alphaY = 1.0 - smoothstep(0.4, 1.0, vUv.y);
          float alphaX = sin(vUv.x * 3.14159); // hump curve
          
          // Final glow: highly transparent since thousands of planes blend together additively
          float finalAlpha = alphaY * alphaX * 0.05;
          
          gl_FragColor = vec4(vColor * 2.0, finalAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    if (material) {
      material.uniforms.time.value = state.clock.elapsedTime * 0.8;
    }
  });

  const geometry = useMemo(() => {
    // Plane from (0,0) to top center, so local +Y scales upwards
    const geo = new THREE.PlaneGeometry(1, 1, 4, 4);
    geo.translate(0, 0.5, 0);
    return geo;
  }, []);

  useEffect(() => {
    if (!spaceWeather?.ovation?.coordinates || !meshRef.current) return;

    const data = spaceWeather.ovation.coordinates;
    const threshold = 15; // Filter low density noise to form distinct curtain walls
    console.log('[AuroraCurtains] Ovation data length:', data.length);

    const visiblePoints = [];
    for (let i = 0; i < data.length; i++) {
      // data[i] is [lon, lat, value]
      if (data[i][1] >= 0 && data[i][2] >= threshold) {
        visiblePoints.push(data[i]);
      }
    }

    const count = Math.min(visiblePoints.length, maxInstances);
    if (count === 0) return;

    const dummy = new THREE.Object3D();
    const upVector = new THREE.Vector3(0, 1, 0);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const [lon, lat, value] = visiblePoints[i];

      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(earthRadius * Math.sin(phi) * Math.cos(theta));
      const z = earthRadius * Math.sin(phi) * Math.sin(theta);
      const y = earthRadius * Math.cos(phi);

      if (i === 0) {
        console.log('[AuroraCurtains] First instance coords (x,y,z):', x, y, z);
      }

      const normal = new THREE.Vector3(x, y, z).normalize();

      // Stand the plane straight up perfectly perpendicular to ground
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        upVector,
        normal,
      );

      dummy.position.set(x, y, z);
      dummy.quaternion.copy(quaternion);

      // Randomly rotate to make curtains thick and messy instead of flat grid
      dummy.rotateY(Math.random() * Math.PI);

      // Intensity 0.0 to 1.0
      const intensity = Math.min(value / 10, 1.0);

      // Vast vertical scale so curtains soar above the atmosphere
      const scaleHeight = intensity * 12.0 + 2.0;
      const scaleWidth = 0.8 + Math.random() * 0.5; // Thick varied planes
      dummy.scale.set(scaleWidth, scaleHeight, 1);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Transition from faint green to bright purple/white
      color.setHSL(0.35 - intensity * 0.45, 0.9, 0.3 + intensity * 0.4);
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.count = count;
    meshRef.current.instanceMatrix.needsUpdate = true;

    // This physically creates and locks the float32 capacity for colors!
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    setIsReady(true);
  }, [spaceWeather, earthRadius]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, maxInstances]}
      visible={isReady}
    />
  );
}
