import { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import Earth from './components/Earth';
import Overlay from './components/Overlay';
import StormModePicker from './components/StormModePicker';
import RotationControl from './components/RotationControl';
import { useSpaceWeather } from './hooks/useSpaceWeather';
import {
  generateStormOvation,
  generateSubstormOvation,
} from './utils/stormData';
import './index.css';

// Pre-generate storm data once (expensive, ~10k points)
const STORM_DATA = generateStormOvation();
const SUBSTORM_DATA = generateSubstormOvation();

function App() {
  const spaceWeather = useSpaceWeather();
  const [stormMode, setStormMode] = useState('live');
  const [autoRotate, setAutoRotate] = useState(false);

  // Override ovation coordinates when in demo mode
  const effectiveSpaceWeather = useMemo(() => {
    if (stormMode === 'live') return spaceWeather;
    const demoCoords = stormMode === 'storm' ? STORM_DATA : SUBSTORM_DATA;
    return {
      ...spaceWeather,
      ovation: { coordinates: demoCoords },
    };
  }, [spaceWeather, stormMode]);

  return (
    <div className="app-container">
      <Overlay spaceWeather={effectiveSpaceWeather} stormMode={stormMode} />
      <RotationControl
        autoRotate={autoRotate}
        onToggle={() => setAutoRotate(!autoRotate)}
      />
      <StormModePicker stormMode={stormMode} onChange={setStormMode} />

      <div className="canvas-container">
        <Canvas camera={{ position: [0, 8, 18], fov: 45 }}>
          <color attach="background" args={['#000005']} />
          <ambientLight intensity={0.2} />
          <Suspense fallback={null}>
            <Earth
              position={[0, -16, 0]}
              spaceWeather={effectiveSpaceWeather}
              autoRotate={autoRotate}
            />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default App;
