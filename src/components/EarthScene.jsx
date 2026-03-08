import PropTypes from 'prop-types';
import styled from 'styled-components';
import Earth from './Earth';
import KpLayer from './layers/KpLayer';
import BzIndicator from './layers/BzIndicator';
import SolarWindLayer from './layers/SolarWindLayer';
import DstLayer from './layers/DstLayer';
import HemisphericPowerLayer from './layers/HemisphericPowerLayer';

const MetricsGroup = styled.div`
  position: absolute;
  top: 7rem;
  z-index: 15;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: ${(p) => (p.$isIdle ? 0.2 : 1)};

  @media (max-width: 1280px) {
    display: none;
  }
`;

const LeftMetrics = styled(MetricsGroup)`
  left: calc(2.2rem + env(safe-area-inset-left));
`;

const RightMetrics = styled(MetricsGroup)`
  right: calc(2.2rem + env(safe-area-inset-right));
  align-items: flex-end;
`;

// HUD layer container — rendered outside Canvas via portals pattern;
// these are absolutely-positioned HTML overlays imported here for logical grouping
// and conditionally rendered by App.jsx passing them to Overlay.

export function EarthHUDLayers({ spaceWeather, isIdle }) {
  return (
    <>
      <LeftMetrics $isIdle={isIdle}>
        <BzIndicator solarWind={spaceWeather?.solarWind} />
        <SolarWindLayer solarWind={spaceWeather?.solarWind} />
        <DstLayer dst={spaceWeather?.dst} />
      </LeftMetrics>
      <RightMetrics $isIdle={isIdle}>
        <HemisphericPowerLayer hemisphericPower={spaceWeather?.hemisphericPower} />
      </RightMetrics>
    </>
  );
}

EarthHUDLayers.propTypes = {
  spaceWeather: PropTypes.object,
  isIdle: PropTypes.bool,
};

// 3D scene component — rendered inside Canvas
export default function EarthScene({
  position,
  spaceWeather,
  stormMode,
  currentDate,
}) {
  return (
    <>
      <Earth
        position={position}
        spaceWeather={spaceWeather}
        stormMode={stormMode}
        currentDate={currentDate}
      />
      {spaceWeather?.kp && (
        <KpLayer kp={spaceWeather.kp} position={position} />
      )}
    </>
  );
}

EarthScene.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  spaceWeather: PropTypes.object,
  stormMode: PropTypes.string,
  currentDate: PropTypes.instanceOf(Date),
};
