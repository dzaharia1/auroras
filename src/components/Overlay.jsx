import { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Info } from 'lucide-react';
import SourcesModal from './SourcesModal';

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

export default function Overlay({ spaceWeather }) {
  const [showSources, setShowSources] = useState(false);
  const { loading } = spaceWeather;

  if (loading) return <Container />;

  return (
    <>
      <Container>
        <Header>
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

      {showSources && <SourcesModal onClose={() => setShowSources(false)} />}
    </>
  );
}

Overlay.propTypes = {
  spaceWeather: PropTypes.shape({
    loading: PropTypes.bool,
  }).isRequired,
};
