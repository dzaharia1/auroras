import PropTypes from 'prop-types';
import styled from 'styled-components';
import Earth from './Earth';
import { useLayerContext } from '../context/LayerContext';
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

export function EarthHUDLayers({ spaceWeather, layers, isIdle }) {
  const hasLeft = layers.bz || layers.solarWind || layers.dst;
  const hasRight = layers.hemisphericPower;

  return (
    <>
      {hasLeft && (
        <LeftMetrics $isIdle={isIdle}>
          {layers.bz && <BzIndicator solarWind={spaceWeather?.solarWind} />}
          {layers.solarWind && <SolarWindLayer solarWind={spaceWeather?.solarWind} />}
          {layers.dst && <DstLayer dst={spaceWeather?.dst} />}
        </LeftMetrics>
      )}
      {hasRight && (
        <RightMetrics $isIdle={isIdle}>
          {layers.hemisphericPower && (
            <HemisphericPowerLayer hemisphericPower={spaceWeather?.hemisphericPower} />
          )}
        </RightMetrics>
      )}
    </>
  );
}

EarthHUDLayers.propTypes = {
  spaceWeather: PropTypes.object,
  layers: PropTypes.object.isRequired,
  isIdle: PropTypes.bool,
};

// 3D scene component — rendered inside Canvas
export default function EarthScene({
  position,
  spaceWeather,
  stormMode,
  currentDate,
}) {
  const { layers } = useLayerContext();

  return (
    <>
      <Earth
        position={position}
        spaceWeather={spaceWeather}
        stormMode={stormMode}
        currentDate={currentDate}
      />
      {layers.kp && spaceWeather?.kp && (
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
