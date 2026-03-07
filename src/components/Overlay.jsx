import { useState } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes, css } from 'styled-components';
import { Info } from 'lucide-react';
import SourcesModal from './SourcesModal';
import { EarthHUDLayers } from './EarthScene';
import { useLayerContext } from '../context/LayerContext';
import SolarFlareLayer from './layers/SolarFlareLayer';
import SolarCycleLayer from './layers/SolarCycleLayer';
import SolarWindOriginLayer from './layers/SolarWindOriginLayer';

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
`;

export default function Overlay({
  spaceWeather,
  stormMode,
  isIdle,
  activeView,
}) {
  const [showSources, setShowSources] = useState(false);
  const { layers } = useLayerContext();
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
          layers={layers}
          isIdle={isIdle}
        />
      )}

      {/* Sun HUD layers */}
      {activeView === 'sun' && (
        <>
          {layers.solarFlares && (
            <SolarFlareLayer xray={spaceWeather?.xray} isIdle={isIdle} />
          )}
          {layers.solarCycle && <SolarCycleLayer isIdle={isIdle} />}
          {layers.solarWindOrigin && (
            <SolarWindOriginLayer
              solarWind={spaceWeather?.solarWind}
              isIdle={isIdle}
            />
          )}
        </>
      )}

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
