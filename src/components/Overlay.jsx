import React from 'react';
import styled from 'styled-components';

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
  justify-content: space-between;
  align-items: flex-start;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

const TitleBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const StatsContainer = styled.div`
  pointer-events: auto;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StatGlass = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  min-width: 120px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
`;

const StatUnit = styled.span`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 2px;
`;

export default function Overlay({ spaceWeather }) {
  const { solarWind, kp, loading, error } = spaceWeather;

  return (
    <Container>
      <Header>
        <TitleBox>
          <Title>Aurorae</Title>
          <Subtitle>Real-time space weather dynamics, sourced from</Subtitle>
        </TitleBox>
      </Header>

      {/* <StatsContainer>
        <StatGlass>
          <StatLabel>Solar Wind</StatLabel>
          <StatValue>
            {loading ? '--' : solarWind?.speed?.toFixed(0) || 'N/A'}
            <StatUnit>km/s</StatUnit>
          </StatValue>
        </StatGlass>
        <StatGlass>
          <StatLabel>Density</StatLabel>
          <StatValue>
            {loading ? '--' : solarWind?.density?.toFixed(1) || 'N/A'}
            <StatUnit>p/cm³</StatUnit>
          </StatValue>
        </StatGlass>
        <StatGlass>
          <StatLabel>Bz (IMF)</StatLabel>
          <StatValue>
            {loading ? '--' : solarWind?.bz?.toFixed(1) || 'N/A'}
            <StatUnit>nT</StatUnit>
          </StatValue>
        </StatGlass>
        <StatGlass>
          <StatLabel>Kp Index</StatLabel>
          <StatValue>{loading ? '--' : kp?.kp?.toFixed(1) || 'N/A'}</StatValue>
        </StatGlass>
      </StatsContainer> */}
    </Container>
  );
}
