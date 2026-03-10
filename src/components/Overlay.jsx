import { useState } from 'react';
import PropTypes from 'prop-types';
import ViewSwitcher from './view-controls/ViewSwitcher';
import { styled, keyframes, css } from 'styled-components';
import { Settings2, X, BarChart2 } from 'lucide-react';
import Button from './common/Button';
import SourcesButton from './view-controls/SourcesButton';
import SourcesModal from './SourcesModal';
import SolarFlareLayer from './data/SolarFlareLayer';
import SolarCycleLayer from './data/SolarCycleLayer';
import SolarWindOriginLayer from './data/SolarWindOriginLayer';
import BzIndicator from './data/BzIndicator';
import SolarWindLayer from './data/SolarWindLayer';
import DstLayer from './data/DstLayer';
import HemisphericPowerLayer from './data/HemisphericPowerLayer';
import MobileDataOverlay from './MobileDataOverlay';
import Timeline from './view-controls/Timeline';
import FullscreenControl from './view-controls/FullscreenControl';
import WavelengthSelector from './WavelengthSelector';
import MobileControlsDialog from './view-controls/MobileControlsDialog';

const OverlayContainer = styled.div`
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  width: 100dvw;
  height: 100dvh;
  opacity: ${({ $isIdle }) => ($isIdle ? 0.15 : 1)};
  transition: opacity 0.2s ease;

  padding-top: calc(2rem + env(safe-area-inset-top));
  padding-bottom: calc(2rem + env(safe-area-inset-bottom));
  padding-left: calc(2rem + env(safe-area-inset-left));
  padding-right: calc(2rem + env(safe-area-inset-right));
  box-sizing: border-box;
  z-index: 10;
`;

const OverlayRow = styled.div`
  pointer-events: ${({ $isIdle }) => ($isIdle ? 'none' : 'auto')};
  display: ${(props) => (props.screenSize === 'desktop' ? 'flex' : 'none')};
  flex-direction: row;
  justify-content: space-between;
  align-items: ${(props) =>
    props.row === 'topRow' ? 'flex-start' : 'flex-end'};
  width: 100%;
  gap: 2rem;

  @media (max-width: 1150px) {
    display: ${(props) => (props.screenSize === 'desktop' ? 'none' : 'flex')};
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: 0;
`;

const SubTitle = styled.h2`
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const Badge = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  pointer-events: none;
  background: ${(p) =>
    p.$live ? 'rgba(100, 220, 180, 0.15)' : 'rgba(255, 180, 60, 0.15)'};
  border: 1px solid
    ${(p) => (p.$live ? 'rgba(100, 220, 180, 0.4)' : 'rgba(255, 180, 60, 0.4)')};
  color: ${(p) =>
    p.$live ? 'rgba(140, 255, 210, 1)' : 'rgba(255, 210, 100, 1)'};

  ${(p) =>
    p.$live &&
    css`
      &::before {
        content: '';
        display: inline-block;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: rgba(140, 255, 210, 1);
        margin-right: 0.4rem;
        animation: ${pulse} 2s infinite;
        vertical-align: middle;
      }
    `}
`;

const DataColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const MobileDataButton = styled.div`
  display: block;
  position: absolute;
  bottom: calc(1.5rem + env(safe-area-inset-bottom));
  left: calc(1.5rem + env(safe-area-inset-left));
  z-index: 20;
  transition: opacity 0.3s ease;
  opacity: ${(p) => (p.$isIdle ? 0.15 : 1)};
  pointer-events: ${(p) => (p.$isIdle ? 'none' : 'auto')};
`;

function StatusBadge({
  isLive,
  isHistorical,
  stormMode,
  component: Component = Badge,
}) {
  return (
    <Component $live={isLive}>
      {isLive && 'Live'}
      {isHistorical && 'Historical'}
      {stormMode === 'storm' && 'G4–G5 Simulation'}
      {stormMode === 'substorm' && 'G1–G3 Simulation'}
    </Component>
  );
}

StatusBadge.propTypes = {
  isLive: PropTypes.bool,
  isHistorical: PropTypes.bool,
  stormMode: PropTypes.string,
  component: PropTypes.any,
};

const Overlay = ({
  spaceWeather,
  stormMode,
  isIdle,
  activeView,
  onViewChange,
  setStormMode,
  handleHistoricalData,
  resetTrigger,
  year,
  day,
  onYearChange,
  onDayChange,
  sunWavelength,
  setSunWavelength,
}) => {
  const [showSources, setShowSources] = useState(false);
  const [mobileOverlayOpen, setMobileOverlayOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const isLive = stormMode === 'live';

  return (
    <>
      <OverlayContainer isIdle={isIdle}>
        {/* Desktop Markup */}
        <OverlayRow row="topRow" screenSize="desktop">
          <Header>
            <Title>Space Weather</Title>
            <SubTitle>
              Forecasted and historical space weather dynamics
            </SubTitle>
            <SourcesButton onClick={() => setShowSources(true)} />
          </Header>
          {activeView === 'earth' && (
            <StatusBadge
              isLive={isLive}
              isHistorical={stormMode === 'historical'}
              stormMode={stormMode}
            />
          )}
          <ViewSwitcher activeView={activeView} onViewChange={onViewChange} />
        </OverlayRow>
        <OverlayRow row="bottomRow" screenSize="desktop">
          <DataColumn>
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
                <SolarCycleLayer />
                <SolarWindOriginLayer solarWind={spaceWeather?.solarWind} />
              </>
            )}
          </DataColumn>
          {activeView === 'earth' && (
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
          )}
          {activeView === 'sun' && (
            <WavelengthSelector
              wavelength={sunWavelength}
              onWavelengthChange={setSunWavelength}
              isIdle={isIdle}
              inline
            />
          )}
          <FullscreenControl />
        </OverlayRow>

        {/* Mobile markup */}
        <OverlayRow row="topRow" screenSize="mobile">
          <Header>
            <Title>Space Weather</Title>
            <SubTitle>
              Forecasted and historical space weather dynamics
            </SubTitle>
            <SourcesButton onClick={() => setShowSources(true)} />
          </Header>
          <ViewSwitcher activeView={activeView} onViewChange={onViewChange} />
        </OverlayRow>
        <OverlayRow row="bottomRow" screenSize="mobile">
          <Button
            onClick={() => setMobileOverlayOpen(true)}
            style={{ height: '48px' }}>
            <BarChart2 size={18} />
            Data
          </Button>
          {activeView === 'earth' && (
            <StatusBadge
              isLive={isLive}
              isHistorical={stormMode === 'historical'}
              stormMode={stormMode}
            />
          )}
          <Button
            onClick={() => setShowControls(true)}
            style={{ height: '48px' }}>
            <Settings2 size={18} />
            Controls
          </Button>
        </OverlayRow>
      </OverlayContainer>
      <MobileDataOverlay
        isOpen={mobileOverlayOpen}
        onClose={() => setMobileOverlayOpen(false)}
        activeView={activeView}
        spaceWeather={spaceWeather}
        stormMode={stormMode}
      />
      {mobileOverlayOpen && <MobileDataOverlay />}
      {showSources && <SourcesModal onClose={() => setShowSources(false)} />}
      <MobileControlsDialog
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        activeView={activeView}
        handleHistoricalData={handleHistoricalData}
        resetTrigger={resetTrigger}
        stormMode={stormMode}
        setStormMode={setStormMode}
        year={year}
        day={day}
        onYearChange={onYearChange}
        onDayChange={onDayChange}
        sunWavelength={sunWavelength}
        setSunWavelength={setSunWavelength}
      />
    </>
  );
};

Overlay.propTypes = {
  spaceWeather: PropTypes.object.isRequired,
  stormMode: PropTypes.string.isRequired,
  isIdle: PropTypes.bool.isRequired,
  activeView: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
  setStormMode: PropTypes.func.isRequired,
  handleHistoricalData: PropTypes.func.isRequired,
  resetTrigger: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  day: PropTypes.number.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onDayChange: PropTypes.func.isRequired,
  sunWavelength: PropTypes.string.isRequired,
  setSunWavelength: PropTypes.func.isRequired,
};

export default Overlay;
