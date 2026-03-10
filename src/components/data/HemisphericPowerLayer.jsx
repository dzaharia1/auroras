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
  margin-bottom: 0.2rem;
`;

const Value = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(p) => {
    const gw = parseFloat(p.$total);
    if (gw > 200) return '#ff4d4d';
    if (gw > 50) return '#ffb84d';
    if (gw > 20) return '#ffd166';
    return 'rgba(255,255,255,0.6)';
  }};
`;

const Sub = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.1rem;
`;

export default function HemisphericPowerLayer({ hemisphericPower }) {
  const current = hemisphericPower?.current;
  if (!current || current.total === null) return null;

  const total = Math.round(current.total);

  return (
    <Container>
      <Label>Hemispheric Power</Label>
      <Value $total={total}>{total} GW</Value>
      {current.north !== null && current.south !== null && (
        <Sub>
          N {Math.round(current.north)} · S {Math.round(current.south)}
        </Sub>
      )}
    </Container>
  );
}

HemisphericPowerLayer.propTypes = {
  hemisphericPower: PropTypes.shape({
    current: PropTypes.shape({
      north: PropTypes.number,
      south: PropTypes.number,
      total: PropTypes.number,
    }),
  }),
};
