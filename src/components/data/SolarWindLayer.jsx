import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  font-family: 'Inter', sans-serif;
  color: white;
`;

const Label = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 0.3rem;
`;

const Row = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
`;

const BigValue = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${(p) => {
    const s = parseFloat(p.$speed);
    if (s > 600) return '#ff6b6b';
    if (s > 400) return '#ffd166';
    return '#8cdcd2';
  }};
`;

const Unit = styled.span`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.4);
`;

export default function SolarWindLayer({ solarWind }) {
  const speed = solarWind?.speed ?? null;
  const density = solarWind?.density ?? null;

  return (
    <Container>
      <Label>Solar Wind</Label>
      {speed === null ? (
        <Row>
          <BigValue $speed={-1} style={{ color: 'rgba(255,255,255,0.45)' }}>—</BigValue>
        </Row>
      ) : (
        <>
          <Row>
            <BigValue $speed={speed}>{Math.round(speed)}</BigValue>
            <Unit>km/s</Unit>
          </Row>
          {density !== null && (
            <Row>
              <BigValue $speed={0}>{density.toFixed(1)}</BigValue>
              <Unit>p/cm³</Unit>
            </Row>
          )}
        </>
      )}
    </Container>
  );
}

SolarWindLayer.propTypes = {
  solarWind: PropTypes.shape({
    speed: PropTypes.number,
    density: PropTypes.number,
  }),
};
