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

const Value = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(p) => {
    const v = parseFloat(p.$value);
    if (v <= -100) return '#ff4d4d';
    if (v <= -50) return '#ffb84d';
    if (v <= -30) return '#ffd166';
    return 'rgba(255,255,255,0.6)';
  }};
`;

const Sparkline = styled.svg`
  display: block;
  margin-top: 0.3rem;
  overflow: visible;
`;

function renderSparkline(trend, width = 100, height = 24) {
  if (!trend || trend.length < 2) return null;

  const values = trend.map((e) => e.value).filter((v) => v !== null);
  if (values.length < 2) return null;

  const min = Math.min(...values, 0); // include 0 so positive dst is visible
  const max = Math.max(...values, 0);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  // Color by last value
  const lastVal = values[values.length - 1];
  const stroke =
    lastVal <= -100
      ? '#ff4d4d'
      : lastVal <= -50
        ? '#ffb84d'
        : 'rgba(255,255,255,0.4)';

  return (
    <Sparkline width={width} height={height + 2} viewBox={`0 -1 ${width} ${height + 2}`}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Sparkline>
  );
}

export default function DstLayer({ dst }) {
  const current = dst?.current;
  const trend = dst?.trend;

  return (
    <Container>
      <Label>Dst Index</Label>
      {!current ? (
        <Value $value={0}>—</Value>
      ) : (
        <>
          <Value $value={current.value}>
            {current.value > 0 ? '+' : ''}{Math.round(current.value)} nT
          </Value>
          {renderSparkline(trend)}
        </>
      )}
    </Container>
  );
}

DstLayer.propTypes = {
  dst: PropTypes.shape({
    current: PropTypes.shape({ value: PropTypes.number }),
    trend: PropTypes.arrayOf(
      PropTypes.shape({ value: PropTypes.number }),
    ),
  }),
};
