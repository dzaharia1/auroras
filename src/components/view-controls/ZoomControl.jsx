import styled from 'styled-components';
import PropTypes from 'prop-types';

const Container = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(20, 20, 30, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 1rem;
  height: 48px;
`;

const Slider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.1);
  height: 4px;
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #8cffd2;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(100, 255, 210, 0.5);
  }
`;

const Label = styled.span`
  font-size: 0.8rem;
  opacity: 0.5;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export default function ZoomControl({ zoomRadius, onZoomChange }) {
  return (
    <Container>
      <Label>Zoom</Label>
      <Slider
        type="range"
        min="10"
        max="40"
        step="0.1"
        value={zoomRadius}
        onChange={(e) => onZoomChange(parseFloat(e.target.value))}
      />
    </Container>
  );
}

ZoomControl.propTypes = {
  zoomRadius: PropTypes.number.isRequired,
  onZoomChange: PropTypes.func.isRequired,
};
