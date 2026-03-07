import PropTypes from 'prop-types';
import styled, { keyframes, css } from 'styled-components';

const alertPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 80, 80, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(255, 80, 80, 0); }
`;

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
  margin-bottom: 0.3rem;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  background: ${(p) => flareBackground(p.$cls)};
  border: 1px solid ${(p) => flareBorder(p.$cls)};
  color: ${(p) => flareColor(p.$cls)};

  ${(p) =>
    p.$alert &&
    css`
      animation: ${alertPulse} 2s infinite;
    `}
`;

const Sub = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.3rem;
`;

function flareBackground(cls) {
  if (cls === 'X') return 'rgba(255, 50, 50, 0.15)';
  if (cls === 'M') return 'rgba(255, 140, 40, 0.15)';
  if (cls === 'C') return 'rgba(255, 210, 60, 0.1)';
  return 'rgba(255, 255, 255, 0.05)';
}

function flareBorder(cls) {
  if (cls === 'X') return 'rgba(255, 50, 50, 0.5)';
  if (cls === 'M') return 'rgba(255, 140, 40, 0.4)';
  if (cls === 'C') return 'rgba(255, 210, 60, 0.3)';
  return 'rgba(255, 255, 255, 0.1)';
}

function flareColor(cls) {
  if (cls === 'X') return '#ff6b6b';
  if (cls === 'M') return '#ffa94d';
  if (cls === 'C') return '#ffd166';
  return 'rgba(255,255,255,0.6)';
}

export default function SolarFlareLayer({ xray, isIdle }) {
  const cls = xray?.peak24h?.fluxClass ?? xray?.current?.fluxClass ?? null;
  const isAlert = xray?.activeAlert ?? false;

  return (
    <Container $isIdle={isIdle}>
      <Label>X-Ray Flux (24h peak)</Label>
      <Badge $cls={cls} $alert={isAlert}>
        {cls ?? '—'} class
      </Badge>
      {isAlert && (
        <Sub>Solar flare alert active</Sub>
      )}
    </Container>
  );
}

SolarFlareLayer.propTypes = {
  xray: PropTypes.shape({
    current: PropTypes.shape({ fluxClass: PropTypes.string }),
    peak24h: PropTypes.shape({ fluxClass: PropTypes.string }),
    activeAlert: PropTypes.bool,
  }),
  isIdle: PropTypes.bool,
};
