import { Suspense, useState, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import PropTypes from 'prop-types';
import Earth from './components/Earth';
import Overlay from './components/Overlay';
import ViewControlPanel from './components/view-controls/ViewControlPanel';
import { useSpaceWeather } from './hooks/useSpaceWeather';
import {
  generateStormOvation,
  generateSubstormOvation,
  generateQuietOvation,
} from './utils/stormData';
import './index.css';

// Pre-generate storm data once (expensive, ~10k points)
const STORM_DATA = generateStormOvation();
const SUBSTORM_DATA = generateSubstormOvation();
const QUIET_DATA = generateQuietOvation();

// Component to manage camera position for an oblique North Pole view
function NorthPoleCamera({ zoomRadius = 25 }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    const vFovRad = (camera.fov * Math.PI) / 180;
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);

    // Standard distance to fit the radius horizontally
    const distance = zoomRadius / Math.sin(hFovRad / 2);

    // Position the camera at a steep angle
    // tiltAngle = Math.PI * 0.25 is 45 degrees
    const tiltAngle = Math.PI * 0.28;
    const y = distance * Math.cos(tiltAngle);
    const z = distance * Math.sin(tiltAngle);

    camera.position.set(0, y, z);
    camera.lookAt(0, 12, 0); // Targeted focus on the upper hemisphere
    camera.updateProjectionMatrix();
  }, [camera, size, zoomRadius]);

  return null;
}

NorthPoleCamera.propTypes = {
  zoomRadius: PropTypes.number,
};

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
      let demoCoords = QUIET_DATA; // Fallback to quiet glow
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
        <Canvas camera={{ position: [0, 50, 0], fov: 45 }}>
          <color attach="background" args={['#000005']} />
          <NorthPoleCamera zoomRadius={14} />
          <ambientLight intensity={0.2} />
          <Suspense fallback={null}>
            <Earth
              position={[0, 0, 0]}
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
