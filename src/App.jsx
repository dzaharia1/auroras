import { Suspense, useState, useMemo, useEffect, useCallback } from 'react';
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

// Tunable camera constants
const CAMERA_TILT_DEG = 55; // Degrees from horizontal (looking down)
const CAMERA_FOCUS_HEIGHT = 15; // Focus point height (Earth radius is 18)
const CAMERA_ZOOM_RADIUS = 16; // Controls how much of the globe fills the width

// Component to manage camera position for an oblique North Pole view
function NorthPoleCamera({ zoomRadius, onZoomChange }) {
  const { camera, size, gl } = useThree();

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      onZoomChange(Math.max(10, Math.min(40, zoomRadius + e.deltaY * 0.01)));
    };

    const el = gl.domElement;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [gl, zoomRadius, onZoomChange]);

  useEffect(() => {
    const aspect = size.width / size.height;
    const vFovRad = (camera.fov * Math.PI) / 180;
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);

    // Dynamic distance based on the current zoomRadius
    const distance = zoomRadius / Math.sin(hFovRad / 2);

    // Angle from vertical (Y-axis) is 90 minus tilt from horizontal
    const tiltRad = ((90 - CAMERA_TILT_DEG) * Math.PI) / 180;

    const y = distance * Math.cos(tiltRad);
    const z = distance * Math.sin(tiltRad);

    camera.position.set(0, y, z);

    // Dynamic focus: as we zoom out (larger zoomRadius), we pan the camera down (lower lookAt height)
    // This shifts the Earth slightly upwards in the viewport as it gets smaller.
    const zoomFactor = (zoomRadius - 10) / 30; // 0 to 1 based on current zoom range
    const currentFocusY = CAMERA_FOCUS_HEIGHT - zoomFactor * 10;

    camera.lookAt(0, currentFocusY, 0);
    camera.updateProjectionMatrix();
  }, [camera, size, zoomRadius]);

  return null;
}

NorthPoleCamera.propTypes = {
  zoomRadius: PropTypes.number.isRequired,
  onZoomChange: PropTypes.func.isRequired,
};

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date -
    start +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function App() {
  const spaceWeather = useSpaceWeather();
  const [stormMode, setStormMode] = useState('live');
  const [autoRotate, setAutoRotate] = useState(false);
  const [historicalSpaceWeather, setHistoricalSpaceWeather] = useState(null);
  const [zoomRadius, setZoomRadius] = useState(CAMERA_ZOOM_RADIUS);
  const [year, setYear] = useState(new Date().getFullYear());
  const [day, setDay] = useState(getDayOfYear(new Date()));

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

  const handleHistoricalData = useCallback(({ data }) => {
    setHistoricalSpaceWeather(data);
    setStormMode('historical');
  }, []);

  const currentDate = useMemo(() => {
    const d = new Date(year, 0, 1);
    d.setDate(day);
    // Inherit current time to reflect real-world daylight
    const now = new Date();
    d.setHours(now.getHours());
    d.setMinutes(now.getMinutes());
    d.setSeconds(now.getSeconds());
    return d;
  }, [year, day]);

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
        zoomRadius={zoomRadius}
        onZoomChange={setZoomRadius}
        year={year}
        day={day}
        onYearChange={setYear}
        onDayChange={setDay}
      />

      <div className="canvas-container">
        <Canvas camera={{ position: [0, 50, 0], fov: 45 }}>
          <color attach="background" args={['#000005']} />
          <NorthPoleCamera
            zoomRadius={zoomRadius}
            onZoomChange={setZoomRadius}
          />
          <ambientLight intensity={0.2} />
          <Suspense fallback={null}>
            <Earth
              position={[0, 0, 0]}
              spaceWeather={effectiveSpaceWeather}
              stormMode={stormMode}
              autoRotate={autoRotate}
              currentDate={currentDate}
            />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default App;
