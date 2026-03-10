import PropTypes from 'prop-types';
import styled from 'styled-components';
import { X } from 'lucide-react';
import Timeline from './Timeline';
import WavelengthSelector from '../WavelengthSelector';
import Button from '../common/Button';

const StyledOverlay = styled.div`
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

const MobileControlsDialog = ({
  isOpen,
  onClose,
  activeView,
  handleHistoricalData,
  resetTrigger,
  stormMode,
  setStormMode,
  year,
  day,
  onYearChange,
  onDayChange,
  sunWavelength,
  setSunWavelength,
}) => {
  return (
    <StyledOverlay $isOpen={isOpen}>
      <div style={{ flex: 1 }} onClick={onClose} />
      {activeView === 'earth' && (
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
      )}
      {activeView === 'sun' && (
        <WavelengthSelector
          wavelength={sunWavelength}
          onWavelengthChange={setSunWavelength}
          inline
        />
      )}
      <Button fullWidth onClick={onClose} style={{ marginTop: '1rem' }}>
        <X size={20} style={{ marginRight: '8px' }} />
        Close Controls
      </Button>
    </StyledOverlay>
  );
};

MobileControlsDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  activeView: PropTypes.string.isRequired,
  handleHistoricalData: PropTypes.func,
  resetTrigger: PropTypes.number,
  stormMode: PropTypes.string,
  setStormMode: PropTypes.func,
  year: PropTypes.number,
  day: PropTypes.number,
  onYearChange: PropTypes.func,
  onDayChange: PropTypes.func,
  sunWavelength: PropTypes.string,
  setSunWavelength: PropTypes.func,
};

export default MobileControlsDialog;
