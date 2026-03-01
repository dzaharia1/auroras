import { Suspense, useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import Earth from './components/Earth';
import Overlay from './components/Overlay';
import ViewControlPanel from './components/view-controls/ViewControlPanel';
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
  const [historicalSpaceWeather, setHistoricalSpaceWeather] = useState(null);

  const [resetTrigger, setResetTrigger] = useState(0);

  // Clear historical data and trigger reset if user manually selects a different mode
  useEffect(() => {
    if (stormMode !== 'historical') {
      if (historicalSpaceWeather !== null) {
        setHistoricalSpaceWeather(null);
      }
      if (stormMode === 'live') {
        setResetTrigger((prev) => prev + 1);
      }
    }
  }, [stormMode, historicalSpaceWeather]);

  // Override ovation coordinates when in demo mode or historical mode
  const effectiveSpaceWeather = useMemo(() => {
    if (
      stormMode === 'historical' &&
      historicalSpaceWeather &&
      !historicalSpaceWeather.error
    ) {
      const k = historicalSpaceWeather.maxKp || 0;
      let demoCoords = [];
      if (k >= 8)
        demoCoords = STORM_DATA; // G4-G5
      else if (k >= 5) demoCoords = SUBSTORM_DATA; // G1-G3

      return {
        ...spaceWeather,
        loading: false,
        kp: {
          kp: k,
          storm: historicalSpaceWeather.storm,
          visibility: historicalSpaceWeather.visibility,
        },
        ovation: { coordinates: demoCoords },
      };
    }

    if (stormMode === 'live') return spaceWeather;
    const demoCoords = stormMode === 'storm' ? STORM_DATA : SUBSTORM_DATA;
    return {
      ...spaceWeather,
      ovation: { coordinates: demoCoords },
    };
  }, [spaceWeather, stormMode, historicalSpaceWeather]);

  const handleHistoricalData = ({ data }) => {
    setHistoricalSpaceWeather(data);
    setStormMode('historical');
  };

  return (
    <div className="app-container">
      <Overlay spaceWeather={effectiveSpaceWeather} stormMode={stormMode} />
      <ViewControlPanel
        autoRotate={autoRotate}
        onToggleRotate={() => setAutoRotate(!autoRotate)}
        stormMode={stormMode}
        setStormMode={setStormMode}
        handleHistoricalData={handleHistoricalData}
        resetTrigger={resetTrigger}
      />

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
