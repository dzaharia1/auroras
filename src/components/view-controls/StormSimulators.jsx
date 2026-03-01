import styled from 'styled-components';
import PropTypes from 'prop-types';
import Button from '../common/Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: ${(props) => (props.$isMobile ? '100%' : 'auto')};
`;

const Label = styled.span`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 0.25rem;
  text-align: left;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${(props) => (props.$isMobile ? '16px' : '0.5rem')};
  width: 100%;
`;

const MODES = [
  { key: 'substorm', label: '⚡ G1–G2', description: 'Substorm simulation' },
  { key: 'storm', label: '🌌 G4–G5', description: 'Severe storm simulation' },
];

export default function StormSimulators({ stormMode, onChange, isMobile }) {
  return (
    <Container $isMobile={isMobile}>
      {isMobile ? (
        <Label>Simulate storm intensity</Label>
      ) : (
        <Label>Simulation</Label>
      )}
      <ButtonRow $isMobile={isMobile}>
        {MODES.map(({ key, label, description }) => (
          <Button
            key={key}
            active={stormMode === key}
            onClick={() => onChange(key)}
            title={description}
            style={{ flex: 1 }}>
            {label}
          </Button>
        ))}
      </ButtonRow>
    </Container>
  );
}

StormSimulators.propTypes = {
  stormMode: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};
