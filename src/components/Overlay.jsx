import React, { useState } from 'react';
import styled from 'styled-components';
import { Info, X, ExternalLink } from 'lucide-react';

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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: auto;
`;

const ModalContent = styled.div`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  transition: color 0.2s;

  &:hover {
    color: white;
  }
`;

const ModalTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
`;

const SourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SourceItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const SourceName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: white;
`;

const SourceDesc = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
`;

const SourceLink = styled.a`
  color: #8cdcd2;
  font-size: 0.8rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  width: fit-content;
  margin-top: 0.2rem;

  &:hover {
    text-decoration: underline;
  }
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
  const [showSources, setShowSources] = useState(false);
  const { loading } = spaceWeather;

  const sources = [
    {
      name: 'NOAA Space Weather Prediction Center (SWPC)',
      description:
        'Real-time solar wind plasma, magnetometer data, Kp-index, and OVATION aurora models.',
      link: 'https://www.swpc.noaa.gov/',
    },
    {
      name: 'GFZ German Research Centre for Geosciences',
      description:
        'Definitive historical Kp-index data for year-by-year simulations.',
      link: 'https://kp.gfz.de/',
    },
    {
      name: 'NASA Blue Marble Next Generation',
      description:
        'High-resolution base topography and monthly seasonal earth textures.',
      link: 'https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography/',
    },
  ];

  if (loading) return <Container />;

  return (
    <>
      <Container>
        <Header>
          <TitleBox>
            <Title>Aurorae</Title>
            <SourcesButton onClick={() => setShowSources(true)}>
              <Info size={14} />
              Data Sources
            </SourcesButton>
          </TitleBox>
          <Subtitle>Real-time space weather dynamics</Subtitle>
        </Header>
      </Container>

      {showSources && (
        <ModalOverlay onClick={() => setShowSources(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowSources(false)}>
              <X size={20} />
            </CloseButton>
            <ModalTitle>Data Sources</ModalTitle>
            <SourceList>
              {sources.map((source, i) => (
                <SourceItem key={i}>
                  <SourceName>{source.name}</SourceName>
                  <SourceDesc>{source.description}</SourceDesc>
                  <SourceLink
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer">
                    Visit Website <ExternalLink size={12} />
                  </SourceLink>
                </SourceItem>
              ))}
            </SourceList>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
}
