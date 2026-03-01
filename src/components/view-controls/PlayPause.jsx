import styled from 'styled-components';
import PropTypes from 'prop-types';
import Button from '../common/Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  width: ${(props) => (props.$isMobile ? '100%' : 'auto')};
`;

const Label = styled.span`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 0.25rem;
`;

export default function PlayPause({ autoRotate, onToggle, isMobile }) {
  return (
    <Container $isMobile={isMobile}>
      <Label>Rotation</Label>
      <Button
        onClick={onToggle}
        fullWidth={isMobile}
        align={isMobile ? 'center' : 'flex-start'}
        minWidth="120px">
        <span>{autoRotate ? '⏸ Pause' : '▶️ Play'}</span>
      </Button>
    </Container>
  );
}

PlayPause.propTypes = {
  autoRotate: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};
