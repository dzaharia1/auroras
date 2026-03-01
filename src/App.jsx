import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import Earth from './components/Earth';
import Sun from './components/Sun';
// import SpaceWeatherStream from './components/SpaceWeatherStream';
import Overlay from './components/Overlay';
import { useSpaceWeather } from './hooks/useSpaceWeather';
import './index.css';

function App() {
  const spaceWeather = useSpaceWeather();

  return (
    <div className="app-container">
      {/* <Overlay spaceWeather={spaceWeather} /> */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 8, 18], fov: 45 }}>
          <color attach="background" args={['#000005']} />
          <ambientLight intensity={0.2} />

          <Suspense fallback={null}>
            {/* <Sun position={[0, 20, 0]} /> */}
            <Earth position={[0, -16, 0]} spaceWeather={spaceWeather} />
            {/* <SpaceWeatherStream
              sunPosition={[0, 20, 0]}
              earthPosition={[0, -20, 0]}
              spaceWeather={spaceWeather}
            /> */}
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default App;
