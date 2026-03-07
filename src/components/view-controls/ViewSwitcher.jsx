import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  background: rgba(10, 10, 20, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const SwitchButton = styled.button`
  background: ${(p) => (p.$active ? 'rgba(255, 255, 255, 0.15)' : 'transparent')};
  border: none;
  color: ${(p) => (p.$active ? 'white' : 'rgba(255, 255, 255, 0.45)')};
  padding: 0.45rem 1rem;
  font-size: 0.8rem;
  font-weight: ${(p) => (p.$active ? '600' : '400')};
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  letter-spacing: 0.03em;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

export default function ViewSwitcher({ activeView, onViewChange }) {
  return (
    <Container>
      <SwitchButton
        $active={activeView === 'earth'}
        onClick={() => onViewChange('earth')}>
        Earth
      </SwitchButton>
      <SwitchButton
        $active={activeView === 'sun'}
        onClick={() => onViewChange('sun')}>
        Sun
      </SwitchButton>
    </Container>
  );
}

ViewSwitcher.propTypes = {
  activeView: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
};
