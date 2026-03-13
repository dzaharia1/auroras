import PropTypes from 'prop-types';
import styled from 'styled-components';
import { X } from 'lucide-react';
import Button from './common/Button';
import StatusBadge from './common/StatusBadge';
import BzIndicator from './data/BzIndicator';
import SolarWindLayer from './data/SolarWindLayer';
import DstLayer from './data/DstLayer';
import HemisphericPowerLayer from './data/HemisphericPowerLayer';
import SolarFlareLayer from './data/SolarFlareLayer';
import SolarCycleLayer from './data/SolarCycleLayer';
import SolarWindOriginLayer from './data/SolarWindOriginLayer';

const OverlayWrapper = styled.div`
  display: none;
  @media (max-width: 1280px) {
    display: ${(p) => (p.$isOpen ? 'flex' : 'none')};
    flex-direction: column;
    justify-content: flex-end;
    gap: 1.5rem;
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    z-index: 30;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    padding: 2rem;
    padding-bottom: calc(2rem + env(safe-area-inset-bottom));
    padding-left: calc(2rem + env(safe-area-inset-left));
    padding-right: calc(2rem + env(safe-area-inset-right));
    box-sizing: border-box;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const DataMetricsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MobileBottomRightStack = styled.div`
  display: none;
  @media (max-width: 1280px) {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    position: absolute;
    bottom: calc(1.5rem + env(safe-area-inset-bottom) + 48px + 8px);
    right: calc(1.5rem + env(safe-area-inset-right));
    z-index: 20;
    pointer-events: none;
  }
`;

export default function MobileDataOverlay({
  isOpen,
  onClose,
  activeView,
  spaceWeather,
  stormMode,
  date,
}) {
  const isLive = stormMode === 'live';
  const isHistorical = stormMode === 'historical';

  return (
    <OverlayWrapper $isOpen={isOpen}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
        onClick={onClose}
      />

      <DataMetricsColumn>
        {activeView === 'earth' && (
          <>
            <BzIndicator solarWind={spaceWeather?.solarWind} />
            <SolarWindLayer solarWind={spaceWeather?.solarWind} />
            <DstLayer dst={spaceWeather?.dst} />
            <HemisphericPowerLayer
              hemisphericPower={spaceWeather?.hemisphericPower}
            />
          </>
        )}
        {activeView === 'sun' && (
          <>
            <SolarFlareLayer xray={spaceWeather?.xray} />
            <SolarCycleLayer date={date} />
            <SolarWindOriginLayer solarWind={spaceWeather?.solarWind} />
          </>
        )}
      </DataMetricsColumn>

      {activeView === 'earth' && (
        <MobileBottomRightStack>
          <StatusBadge
            isLive={isLive}
            isHistorical={isHistorical}
            stormMode={stormMode}
          />
        </MobileBottomRightStack>
      )}

      <Button fullWidth onClick={onClose} style={{ marginTop: '0.5rem' }}>
        <X size={20} style={{ marginRight: '8px' }} />
        Close
      </Button>
    </OverlayWrapper>
  );
}

MobileDataOverlay.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  activeView: PropTypes.string.isRequired,
  spaceWeather: PropTypes.shape({
    solarWind: PropTypes.object,
    dst: PropTypes.object,
    hemisphericPower: PropTypes.object,
    xray: PropTypes.object,
  }).isRequired,
  stormMode: PropTypes.string,
  date: PropTypes.instanceOf(Date),
};
