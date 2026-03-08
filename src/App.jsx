import { Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import PropTypes from 'prop-types';
import EarthScene from './components/EarthScene';
import SunImageView from './components/SunImageView';
import Overlay from './components/Overlay';
import ViewControlPanel from './components/view-controls/ViewControlPanel';
import { useSpaceWeather } from './hooks/useSpaceWeather';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import { useStormTimeline } from './hooks/useStormTimeline';
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

const CAMERA_ZOOM_RADIUS = 28;

function EarthCamera({ zoomRadius, onZoomChange }) {
  const { camera, size, gl } = useThree();

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      onZoomChange(Math.max(20, Math.min(50, zoomRadius + e.deltaY * 0.05)));
    };

    const el = gl.domElement;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [gl, zoomRadius, onZoomChange]);

  useEffect(() => {
    const aspect = size.width / size.height;
    const vFovRad = (camera.fov * Math.PI) / 180;
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
    const distance = zoomRadius / Math.sin(hFovRad / 2);

    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size, zoomRadius]);

  return null;
}

EarthCamera.propTypes = {
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
  const { isIdle } = useIdleTimeout(10000);
  const stormTimeline = useStormTimeline();

  const [activeView, setActiveView] = useState('earth');
  const [stormMode, setStormMode] = useState('live');
  const [historicalSpaceWeather, setHistoricalSpaceWeather] = useState(null);
  const [zoomRadius, setZoomRadius] = useState(CAMERA_ZOOM_RADIUS);
  const [year, setYear] = useState(new Date().getFullYear());
  const [day, setDay] = useState(getDayOfYear(new Date()));
  const [resetTrigger, setResetTrigger] = useState(0);
  const [sunWavelength, setSunWavelength] = useState('193');

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

  const effectiveSpaceWeather = useMemo(() => {
    if (
      stormMode === 'historical' &&
      historicalSpaceWeather &&
      !historicalSpaceWeather.error
    ) {
      const k = historicalSpaceWeather.maxKp || 0;
      let demoCoords = QUIET_DATA;
      if (k >= 8) demoCoords = STORM_DATA;
      else if (k >= 5) demoCoords = SUBSTORM_DATA;

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
    const now = new Date();
    d.setHours(now.getHours());
    d.setMinutes(now.getMinutes());
    d.setSeconds(now.getSeconds());
    return d;
  }, [year, day]);

  return (
    <div className="app-container">
      <Overlay
        spaceWeather={effectiveSpaceWeather}
        stormMode={stormMode}
        isIdle={isIdle}
        activeView={activeView}
      />
      <ViewControlPanel
        activeView={activeView}
        onViewChange={setActiveView}
        isIdle={isIdle}
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
        stormTimeline={stormTimeline}
        sunWavelength={sunWavelength}
        setSunWavelength={setSunWavelength}
      />

      <div className="canvas-container" style={{ display: activeView === 'sun' ? 'none' : undefined }}>
        <Canvas camera={{ position: [0, 50, 0], fov: 45 }}>
          <color attach="background" args={['#000005']} />
          <EarthCamera
            zoomRadius={zoomRadius}
            onZoomChange={setZoomRadius}
          />
          <ambientLight intensity={0.2} />
          <Suspense fallback={null}>
            <EarthScene
              position={[0, 0, 0]}
              spaceWeather={effectiveSpaceWeather}
              stormMode={stormMode}
              currentDate={currentDate}
            />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>

      {activeView === 'sun' && (
        <div className="canvas-container">
          <SunImageView
            isIdle={isIdle}
            sunWavelength={sunWavelength}
            setSunWavelength={setSunWavelength}
          />
        </div>
      )}
    </div>
  );
}

export default App;
