import { useState } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes, css } from 'styled-components';
import { Info, BarChart2, X } from 'lucide-react';
import SourcesModal from './SourcesModal';
import { EarthHUDLayers } from './EarthScene';
import SolarFlareLayer from './layers/SolarFlareLayer';
import SolarCycleLayer from './layers/SolarCycleLayer';
import SolarWindOriginLayer from './layers/SolarWindOriginLayer';
import BzIndicator from './layers/BzIndicator';
import SolarWindLayer from './layers/SolarWindLayer';
import DstLayer from './layers/DstLayer';
import HemisphericPowerLayer from './layers/HemisphericPowerLayer';
import Button from './common/Button';

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
  padding: 2rem;
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

const TitleBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

const SourcesButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.4rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0.75rem 0;
  width: fit-content;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 1280px) {
    display: none;
  }
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

const MobileDataOverlay = styled.div`
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
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const DataMetricsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

// Mode badge — always visible, exempt from isIdle fade (Principle V)
const ModeBadge = styled.div`
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
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

  @media (max-width: 1280px) {
    display: none;
  }
`;

// Shared badge visual without absolute positioning — used inside the mobile stack
const LiveBadge = styled.div`
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

// Mobile-only stack: live badge (earth) + sources button, positioned 8px above controls button
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

const MobileSourcesAboveData = styled.button`
  display: none;
  @media (max-width: 1280px) {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    position: absolute;
    bottom: calc(1.5rem + env(safe-area-inset-bottom) + 48px + 8px);
    left: calc(1.5rem + env(safe-area-inset-left));
    z-index: 20;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.6);
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }
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
          <TitleBox>
            <Title>Space Weather</Title>
            <SourcesButton onClick={() => setShowSources(true)}>
              <Info size={14} />
              Sources
            </SourcesButton>
          </TitleBox>
          <Subtitle>Forecasted and historical space weather dynamics</Subtitle>
        </Header>
      </Container>

      {/* Mode badge — always visible per constitution Principle V, earth view only */}
      {activeView === 'earth' && (
        <ModeBadge $live={isLive}>
          {isLive && 'Live'}
          {isHistorical && 'Historical'}
          {stormMode === 'storm' && 'G4–G5 Simulation'}
          {stormMode === 'substorm' && 'G1–G3 Simulation'}
        </ModeBadge>
      )}

      {/* Earth HUD layers — 2D overlays outside Canvas */}
      {activeView === 'earth' && (
        <EarthHUDLayers
          spaceWeather={spaceWeather}
          isIdle={isIdle}
        />
      )}

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

      {/* Mobile Data overlay */}
      <MobileDataOverlay $isOpen={showData}>
        <div style={{ flex: 1 }} onClick={() => setShowData(false)} />
        <DataMetricsColumn>
          {activeView === 'earth' && (
            <>
              <BzIndicator solarWind={spaceWeather?.solarWind} />
              <SolarWindLayer solarWind={spaceWeather?.solarWind} />
              <DstLayer dst={spaceWeather?.dst} />
              <HemisphericPowerLayer hemisphericPower={spaceWeather?.hemisphericPower} />
            </>
          )}
          {activeView === 'sun' && (
            <>
              <SolarFlareLayer xray={spaceWeather?.xray} />
              <SolarCycleLayer />
              <SolarWindOriginLayer solarWind={spaceWeather?.solarWind} />
            </>
          )}
        </DataMetricsColumn>
        <Button fullWidth onClick={() => setShowData(false)} style={{ marginTop: '0.5rem' }}>
          <X size={20} style={{ marginRight: '8px' }} />
          Close
        </Button>
      </MobileDataOverlay>

      {/* Mobile: mode indicator 8px above controls button (bottom-right, earth only) */}
      {activeView === 'earth' && (
        <MobileBottomRightStack>
          <LiveBadge $live={isLive}>
            {isLive && 'Live'}
            {isHistorical && 'Historical'}
            {stormMode === 'storm' && 'G4–G5 Simulation'}
            {stormMode === 'substorm' && 'G1–G3 Simulation'}
          </LiveBadge>
        </MobileBottomRightStack>
      )}

      {/* Mobile: sources button 8px above data button (bottom-left, both views) */}
      <MobileSourcesAboveData onClick={() => setShowSources(true)}>
        <Info size={14} />
        Sources
      </MobileSourcesAboveData>

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
