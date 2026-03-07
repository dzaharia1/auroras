import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  top: 8rem;
  left: 2rem;
  z-index: 15;
  font-family: 'Inter', sans-serif;
  color: white;
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: ${(p) => (p.$isIdle ? 0.2 : 1)};
`;

const Label = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 0.2rem;
`;

const Value = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(p) => (p.$southward ? '#60aaff' : 'rgba(255,255,255,0.5)')};
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const Arrow = styled.span`
  font-size: 0.9rem;
  transform: ${(p) => (p.$southward ? 'none' : 'rotate(180deg)')};
  display: inline-block;
`;

export default function BzIndicator({ solarWind, isIdle }) {
  const bz = solarWind?.bz ?? null;
  if (bz === null) return null;

  const southward = bz < 0;

  return (
    <Container $isIdle={isIdle}>
      <Label>IMF Bz</Label>
      <Value $southward={southward}>
        <Arrow $southward={southward}>↓</Arrow>
        {bz > 0 ? '+' : ''}{bz.toFixed(1)} nT
      </Value>
    </Container>
  );
}

BzIndicator.propTypes = {
  solarWind: PropTypes.shape({
    bz: PropTypes.number,
  }),
  isIdle: PropTypes.bool,
};
