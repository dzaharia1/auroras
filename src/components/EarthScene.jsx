import PropTypes from 'prop-types';
import Earth from './Earth';
import { useLayerContext } from '../context/LayerContext';
import KpLayer from './layers/KpLayer';
import BzIndicator from './layers/BzIndicator';
import SolarWindLayer from './layers/SolarWindLayer';
import DstLayer from './layers/DstLayer';
import HemisphericPowerLayer from './layers/HemisphericPowerLayer';

// HUD layer container — rendered outside Canvas via portals pattern;
// these are absolutely-positioned HTML overlays imported here for logical grouping
// and conditionally rendered by App.jsx passing them to Overlay.

export function EarthHUDLayers({ spaceWeather, layers, isIdle }) {
  return (
    <>
      {layers.bz && (
        <BzIndicator solarWind={spaceWeather?.solarWind} isIdle={isIdle} />
      )}
      {layers.solarWind && (
        <SolarWindLayer
          solarWind={spaceWeather?.solarWind}
          isIdle={isIdle}
          hasBz={layers.bz}
        />
      )}
      {layers.dst && (
        <DstLayer dst={spaceWeather?.dst} isIdle={isIdle} />
      )}
      {layers.hemisphericPower && (
        <HemisphericPowerLayer
          hemisphericPower={spaceWeather?.hemisphericPower}
          isIdle={isIdle}
        />
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
