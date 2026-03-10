import { useState } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes, css } from 'styled-components';
import { BarChart2 } from 'lucide-react';
import SourcesModal from './SourcesModal';
import SolarFlareLayer from './data/SolarFlareLayer';
import SolarCycleLayer from './data/SolarCycleLayer';
import SolarWindOriginLayer from './data/SolarWindOriginLayer';
import Button from './common/Button';
import SourcesButton from './view-controls/SourcesButton';
import StatusBadge from './common/StatusBadge';
import MobileDataOverlay from './MobileDataOverlay';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const Container = styled.div`
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: calc(2.2rem + env(safe-area-inset-bottom));
  padding-top: calc(2.2rem + env(safe-area-inset-top));
  padding-left: calc(2.2rem + env(safe-area-inset-left));
  padding-right: calc(2.2rem + env(safe-area-inset-right));
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  color: white;
`;

const Header = styled.div`
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  transition: opacity 0.3s ease;
  opacity: ${(p) => (p.$isIdle ? 0 : 1)};
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const SunControlsWrapper = styled.div`
  position: absolute;
  bottom: calc(2.2rem + env(safe-area-inset-bottom));
  left: calc(2.2rem + env(safe-area-inset-left));
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
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

const MobileDataButton = styled.div`
  display: none;
  @media (max-width: 1280px) {
    display: block;
    position: absolute;
    bottom: calc(1.5rem + env(safe-area-inset-bottom));
    left: calc(1.5rem + env(safe-area-inset-left));
    z-index: 20;
    transition: opacity 0.3s ease;
    opacity: ${(p) => (p.$isIdle ? 0.15 : 1)};
    pointer-events: ${(p) => (p.$isIdle ? 'none' : 'auto')};
  }
`;

const SunMetricsPanel = styled.div`
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

const DesktopModeBadge = styled(Badge)`
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;

  @media (max-width: 1280px) {
    display: none;
  }
`;

export default function Overlay({
  spaceWeather,
  stormMode,
  isIdle,
  activeView,
}) {
  const [showSources, setShowSources] = useState(false);
  const [showData, setShowData] = useState(false);
  const { loading } = spaceWeather;

  const isLive = stormMode === 'live';
  const isHistorical = stormMode === 'historical';

  if (loading) return <Container />;

  return (
    <>
      <Container>
        <Header $isIdle={isIdle}>
          <Title>Space Weather</Title>
          <Subtitle>Forecasted and historical space weather dynamics</Subtitle>
          <div style={{ margin: '0.75rem 0' }}>
            <SourcesButton onClick={() => setShowSources(true)} />
          </div>
        </Header>
      </Container>

      {/* Mode badge — always visible per constitution Principle V, earth view only */}

      {/* Sun HUD layers — grouped in a collapsible data panel */}
      {activeView === 'sun' && (
        <SunControlsWrapper $isIdle={isIdle}>
          <SunMetricsPanel>
            <SolarFlareLayer xray={spaceWeather?.xray} />
            <SolarCycleLayer />
            <SolarWindOriginLayer solarWind={spaceWeather?.solarWind} />
          </SunMetricsPanel>
        </SunControlsWrapper>
      )}

      {/* Mobile Data button — bottom-left, both views */}
      {!showData && (
        <MobileDataButton $isIdle={isIdle}>
          <Button onClick={() => setShowData(true)} style={{ height: '48px' }}>
            <BarChart2 size={18} />
            Data
          </Button>
        </MobileDataButton>
      )}

      {activeView === 'earth' && (
        <StatusBadge
          isLive={isLive}
          isHistorical={isHistorical}
          stormMode={stormMode}
          component={DesktopModeBadge}
        />
      )}

      <MobileDataOverlay
        isOpen={showData}
        onClose={() => setShowData(false)}
        activeView={activeView}
        spaceWeather={spaceWeather}
        stormMode={stormMode}
      />

      {showSources && <SourcesModal onClose={() => setShowSources(false)} />}
    </>
  );
}

Overlay.propTypes = {
  spaceWeather: PropTypes.shape({
    loading: PropTypes.bool,
    solarWind: PropTypes.object,
    kp: PropTypes.object,
    dst: PropTypes.object,
    xray: PropTypes.object,
    hemisphericPower: PropTypes.object,
  }).isRequired,
  stormMode: PropTypes.string,
  isIdle: PropTypes.bool,
  activeView: PropTypes.string,
};
