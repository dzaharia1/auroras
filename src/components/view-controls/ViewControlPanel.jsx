import { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Settings2, X } from 'lucide-react';
import Timeline from './Timeline';
import ZoomControl from './ZoomControl';
import FullscreenControl from './FullscreenControl';
import ViewSwitcher from './ViewSwitcher';
import LayerPanel from './LayerPanel';
import StormTimeline from './StormTimeline';
import Button from '../common/Button';
import WavelengthSelector from '../WavelengthSelector';
import { useLayerContext } from '../../context/LayerContext';

const DesktopContainer = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  z-index: 20;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
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

const MobileBottomRow = styled.div`
  display: none;
  @media (max-width: 1280px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    bottom: calc(1.5rem + env(safe-area-inset-bottom));
    left: calc(1.5rem + env(safe-area-inset-left));
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
  zoomRadius,
  onZoomChange,
  year,
  day,
  onYearChange,
  onDayChange,
  stormTimeline,
}) {
  const [showControls, setShowControls] = useState(false);
  const [showSunControls, setShowSunControls] = useState(false);
  const { sunWavelength, setSunWavelength } = useLayerContext();

  return (
    <>
      {/* Top-right: View switcher + Layer panel */}
      <TopRightControls $isIdle={isIdle}>
        <ViewSwitcher activeView={activeView} onViewChange={onViewChange} />
        <LayerPanel activeView={activeView} />
      </TopRightControls>

      {/* Bottom: Timeline — earth view only */}
      {activeView === 'earth' && (
        <DesktopContainer $isIdle={isIdle}>
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
          <StormTimeline
            timeline={stormTimeline.timeline}
            loading={stormTimeline.loading}
            isIdle={isIdle}
          />
          <FullscreenControl />
        </DesktopContainer>
      )}

      {!showControls && activeView === 'earth' && (
        <MobileBottomRow $isIdle={isIdle}>
          <ZoomControl zoomRadius={zoomRadius} onZoomChange={onZoomChange} />
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
        <ViewSwitcher activeView={activeView} onViewChange={onViewChange} />
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
        <ViewSwitcher activeView={activeView} onViewChange={onViewChange} />
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
  zoomRadius: PropTypes.number.isRequired,
  onZoomChange: PropTypes.func.isRequired,
  year: PropTypes.number.isRequired,
  day: PropTypes.number.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onDayChange: PropTypes.func.isRequired,
  stormTimeline: PropTypes.shape({
    timeline: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
};
