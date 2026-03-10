import PropTypes from 'prop-types';
import Earth from './Earth';
import KpLayer from './data/KpLayer';

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
      {spaceWeather?.kp && <KpLayer kp={spaceWeather.kp} position={position} />}
    </>
  );
}

EarthScene.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  spaceWeather: PropTypes.object,
  stormMode: PropTypes.string,
  currentDate: PropTypes.instanceOf(Date),
};
