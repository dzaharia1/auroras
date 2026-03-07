import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  bottom: 5rem;
  left: 2rem;
  z-index: 15;
  font-family: 'Inter', sans-serif;
  color: white;
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: ${(p) => (p.$isIdle ? 0.2 : 1)};
  width: 160px;
`;

const Label = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 0.4rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.2rem;
`;

const Value = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(p) => p.$color || 'white'};
`;

const Unit = styled.span`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 0.2rem;
`;

const Sub = styled.div`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.25rem;
`;

function speedColor(speed) {
  if (!speed) return 'rgba(255,255,255,0.6)';
  if (speed > 600) return '#ff6b6b';
  if (speed > 400) return '#ffd166';
  return '#6bcb77';
}

export default function SolarWindOriginLayer({ solarWind, isIdle }) {
  const speed = solarWind?.speed ?? null;
  const density = solarWind?.density ?? null;

  return (
    <Container $isIdle={isIdle}>
      <Label>Solar Wind (L1)</Label>
      <Row>
        <div>
          <Value $color={speedColor(speed)}>
            {speed != null ? Math.round(speed) : '—'}
          </Value>
          <Unit>km/s</Unit>
        </div>
      </Row>
      {density != null && (
        <Row>
          <Value>{density.toFixed(1)}</Value>
          <Unit>p/cm³</Unit>
        </Row>
      )}
      <Sub>Measured at L1 by DSCOVR</Sub>
    </Container>
  );
}

SolarWindOriginLayer.propTypes = {
  solarWind: PropTypes.shape({
    speed: PropTypes.number,
    density: PropTypes.number,
  }),
  isIdle: PropTypes.bool,
};
