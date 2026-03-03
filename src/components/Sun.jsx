import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

export default function Sun({ position }) {
  const sunRef = useRef();
  const sunMap = useTexture('/textures/sun.jpg');

  // Custom shader for a sun-like procedural glow surface using downloaded image
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorA: { value: new THREE.Color('#ffaa00') },
        colorB: { value: new THREE.Color('#ff4400') },
        sunTexture: { value: sunMap },
      },
      vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vUv = uv;
                vNormal = normalMatrix * normal;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
      fragmentShader: `
            uniform float time;
            uniform vec3 colorA;
            uniform vec3 colorB;
            uniform sampler2D sunTexture;
            varying vec2 vUv;
            varying vec3 vNormal;

            // Simple noise function
            float noise(vec3 p) {
                return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
            }

            void main() {
                // creating a boiling look
                float n = noise(vNormal + time * 0.1);
                
                // Fresnel for edge glow
                float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                
                vec3 texColor = texture2D(sunTexture, vUv).rgb;
                vec3 glowColor = mix(colorB, colorA, n + intensity);
                
                // Blend texture and boiling edge glow
                vec3 finalColor = mix(texColor, glowColor, 0.3 + intensity * 0.6);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
          `,
    });
  }, [sunMap]);

  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.0005;
      material.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <group position={position}>
      <mesh ref={sunRef} material={material}>
        <sphereGeometry args={[18, 64, 64]} />
      </mesh>

      {/* Outer glow aura */}
      <mesh>
        <sphereGeometry args={[20, 64, 64]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

Sun.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};
