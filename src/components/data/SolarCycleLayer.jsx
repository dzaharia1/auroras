import PropTypes from 'prop-types';
import styled from 'styled-components';

// Solar Cycle 25: minimum Dec 2019, predicted maximum ~Jul 2025, next minimum ~2030
const CYCLE_START = new Date('2019-12-01');
const CYCLE_END = new Date('2030-06-01');
const CYCLE_DURATION_MS = CYCLE_END - CYCLE_START;

function getCycleProgress(date) {
  const ref = date || new Date();
  const elapsed = ref - CYCLE_START;
  return Math.min(Math.max(elapsed / CYCLE_DURATION_MS, 0), 1);
}

function getCyclePhase(progress) {
  if (progress < 0.5) return 'Rising';
  if (progress < 0.6) return 'Near Maximum';
  return 'Declining';
}

const Container = styled.div`
  font-family: 'Inter', sans-serif;
  color: white;
  width: 160px;
`;

const Label = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 0.4rem;
`;

const CycleTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const Phase = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 0.5rem;
`;

const Track = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  position: relative;
  overflow: visible;
`;

const Fill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #4a9eff 0%, #ffb84d 60%, #ff6b6b 100%);
  width: ${(p) => p.$progress * 100}%;
  transition: width 0.5s ease;
`;

const Dot = styled.div`
  position: absolute;
  top: 50%;
  left: ${(p) => p.$progress * 100}%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
`;

export default function SolarCycleLayer({ date }) {
  const progress = getCycleProgress(date);
  const phase = getCyclePhase(progress);

  return (
    <Container>
      <Label>Solar Cycle</Label>
      <CycleTitle>Cycle 25</CycleTitle>
      <Phase>{phase}</Phase>
      <Track>
        <Fill $progress={progress} />
        <Dot $progress={progress} />
      </Track>
    </Container>
  );
}

SolarCycleLayer.propTypes = {
  date: PropTypes.instanceOf(Date),
};
