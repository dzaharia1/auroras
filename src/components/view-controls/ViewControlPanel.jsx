import { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Settings2, X } from 'lucide-react';
import PlayPause from './PlayPause';
import Timeline from './Timeline';
import StormSimulators from './StormSimulators';
import Button from '../common/Button';

const MobileToggleWrapper = styled.div`
  display: none;
  @media (max-width: 1280px) {
    display: block;
    position: absolute;
    bottom: calc(2rem + env(safe-area-inset-bottom));
    right: calc(2.5rem + env(safe-area-inset-right));
    z-index: 20;
  }
`;

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

  & > * {
    pointer-events: auto;
  }

  @media (max-width: 1280px) {
    display: none;
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
  autoRotate,
  onToggleRotate,
  stormMode,
  setStormMode,
  handleHistoricalData,
  resetTrigger,
}) {
  const [showControls, setShowControls] = useState(false);

  return (
    <>
      <DesktopContainer>
        <PlayPause autoRotate={autoRotate} onToggle={onToggleRotate} />
        <Timeline
          onDataFetched={handleHistoricalData}
          resetTrigger={resetTrigger}
          stormMode={stormMode}
          setStormMode={setStormMode}
        />
        <StormSimulators stormMode={stormMode} onChange={setStormMode} />
      </DesktopContainer>

      {!showControls && (
        <MobileToggleWrapper>
          <Button onClick={() => setShowControls(true)}>
            <Settings2 size={18} />
            View Controls
          </Button>
        </MobileToggleWrapper>
      )}

      <MobileOverlay $isOpen={showControls}>
        <div style={{ flex: 1 }} onClick={() => setShowControls(false)} />
        <PlayPause autoRotate={autoRotate} onToggle={onToggleRotate} isMobile />

        <StormSimulators
          stormMode={stormMode}
          onChange={setStormMode}
          isMobile
        />
        <Timeline
          onDataFetched={handleHistoricalData}
          resetTrigger={resetTrigger}
          stormMode={stormMode}
          setStormMode={setStormMode}
          isMobile
        />
        <Button
          fullWidth
          onClick={() => setShowControls(false)}
          style={{ marginTop: '1rem' }}>
          <X size={20} style={{ marginRight: '8px' }} />
          Close Controls
        </Button>
      </MobileOverlay>
    </>
  );
}

ViewControlPanel.propTypes = {
  autoRotate: PropTypes.bool.isRequired,
  onToggleRotate: PropTypes.func.isRequired,
  stormMode: PropTypes.string.isRequired,
  setStormMode: PropTypes.func.isRequired,
  handleHistoricalData: PropTypes.func.isRequired,
  resetTrigger: PropTypes.number.isRequired,
};
