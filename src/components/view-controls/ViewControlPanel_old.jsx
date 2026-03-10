import { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Settings2, X } from 'lucide-react';
import Timeline from './Timeline';
import FullscreenControl from './FullscreenControl';
import ViewSwitcher from './ViewSwitcher';
import Button from '../common/Button';
import WavelengthSelector from '../WavelengthSelector';
import BzIndicator from '../data/BzIndicator';
import SolarWindLayer from '../data/SolarWindLayer';
import DstLayer from '../data/DstLayer';
import HemisphericPowerLayer from '../data/HemisphericPowerLayer';

const DesktopContainer = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  z-index: 20;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 36px;
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: ${(p) => (p.$isIdle ? 0.15 : 1)};

  & > * {
    pointer-events: ${(p) => (p.$isIdle ? 'none' : 'auto')};
  }

  @media (max-width: 1280px) {
    display: none;
  }
`;

const TopRightControls = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 20;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: ${(p) => (p.$isIdle ? 0.15 : 1)};

  & > * {
    pointer-events: ${(p) => (p.$isIdle ? 'none' : 'auto')};
  }
`;

const EarthMetricsPanel = styled.div`
  background: rgba(10, 10, 20, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  min-width: 180px;
  flex-shrink: 0;
`;

const SunDesktopBottomRight = styled.div`
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: ${(p) => (p.$isIdle ? 0.15 : 1)};

  & > * {
    pointer-events: ${(p) => (p.$isIdle ? 'none' : 'auto')};
  }

  @media (max-width: 1280px) {
    display: none;
  }
`;

const MobileBottomRow = styled.div`
  display: none;
  @media (max-width: 1280px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    bottom: calc(1.5rem + env(safe-area-inset-bottom));
    right: calc(1.5rem + env(safe-area-inset-right));
    gap: 0.75rem;
    z-index: 20;
    transition: opacity 0.3s ease;
    opacity: ${(p) => (p.$isIdle ? 0.15 : 1)};
    pointer-events: ${(p) => (p.$isIdle ? 'none' : 'auto')};
  }
`;

const MobileOverlay = styled.div`
  display: none;
  @media (max-width: 1280px) {
    display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
    flex-direction: column;
    justify-content: flex-end;
    gap: 2rem;
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

export default function ViewControlPanel({
  activeView,
  onViewChange,
  isIdle,
  stormMode,
  setStormMode,
  handleHistoricalData,
  resetTrigger,
  year,
  day,
  onYearChange,
  onDayChange,
  spaceWeather,
  sunWavelength,
  setSunWavelength,
}) {
  const [showControls, setShowControls] = useState(false);
  const [showSunControls, setShowSunControls] = useState(false);

  return (
    <>
      {/* Top-right: View switcher */}
      <TopRightControls $isIdle={isIdle}>
        <ViewSwitcher activeView={activeView} onViewChange={onViewChange} />
      </TopRightControls>

      {/* Bottom: Timeline + Earth data box — earth view only */}
      {activeView === 'earth' && (
        <DesktopContainer $isIdle={isIdle}>
          <EarthMetricsPanel>
            <BzIndicator solarWind={spaceWeather?.solarWind} />
            <SolarWindLayer solarWind={spaceWeather?.solarWind} />
            <DstLayer dst={spaceWeather?.dst} />
            <HemisphericPowerLayer
              hemisphericPower={spaceWeather?.hemisphericPower}
            />
          </EarthMetricsPanel>
          <Timeline
            onDataFetched={handleHistoricalData}
            resetTrigger={resetTrigger}
            stormMode={stormMode}
            setStormMode={setStormMode}
            year={year}
            day={day}
            onYearChange={onYearChange}
            onDayChange={onDayChange}
          />
          <FullscreenControl />
        </DesktopContainer>
      )}

      {/* Bottom-right fullscreen — sun view only */}
      {activeView === 'sun' && (
        <SunDesktopBottomRight $isIdle={isIdle}>
          <FullscreenControl />
        </SunDesktopBottomRight>
      )}

      {!showControls && activeView === 'earth' && (
        <MobileBottomRow $isIdle={isIdle}>
          <Button
            onClick={() => setShowControls(true)}
            style={{ height: '48px' }}>
            <Settings2 size={18} />
            Controls
          </Button>
        </MobileBottomRow>
      )}

      <MobileOverlay $isOpen={showControls && activeView === 'earth'}>
        <div style={{ flex: 1 }} onClick={() => setShowControls(false)} />
        {/* <ViewSwitcher activeView={activeView} onViewChange={onViewChange} /> */}
        <Timeline
          onDataFetched={handleHistoricalData}
          resetTrigger={resetTrigger}
          stormMode={stormMode}
          setStormMode={setStormMode}
          isMobile
          year={year}
          day={day}
          onYearChange={onYearChange}
          onDayChange={onDayChange}
        />
        <Button
          fullWidth
          onClick={() => setShowControls(false)}
          style={{ marginTop: '1rem' }}>
          <X size={20} style={{ marginRight: '8px' }} />
          Close Controls
        </Button>
      </MobileOverlay>

      {!showSunControls && activeView === 'sun' && (
        <MobileBottomRow $isIdle={isIdle}>
          <Button
            onClick={() => setShowSunControls(true)}
            style={{ height: '48px' }}>
            <Settings2 size={18} />
            Controls
          </Button>
        </MobileBottomRow>
      )}

      <MobileOverlay $isOpen={showSunControls && activeView === 'sun'}>
        <div style={{ flex: 1 }} onClick={() => setShowSunControls(false)} />
        {/* <ViewSwitcher activeView={activeView} onViewChange={onViewChange} /> */}
        <WavelengthSelector
          wavelength={sunWavelength}
          onWavelengthChange={setSunWavelength}
          inline
        />
        <Button
          fullWidth
          onClick={() => setShowSunControls(false)}
          style={{ marginTop: '1rem' }}>
          <X size={20} style={{ marginRight: '8px' }} />
          Close Controls
        </Button>
      </MobileOverlay>
    </>
  );
}

ViewControlPanel.propTypes = {
  activeView: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
  isIdle: PropTypes.bool.isRequired,
  stormMode: PropTypes.string.isRequired,
  setStormMode: PropTypes.func.isRequired,
  handleHistoricalData: PropTypes.func.isRequired,
  resetTrigger: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  day: PropTypes.number.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onDayChange: PropTypes.func.isRequired,
  spaceWeather: PropTypes.object,
  sunWavelength: PropTypes.string.isRequired,
  setSunWavelength: PropTypes.func.isRequired,
};
