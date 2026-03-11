import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { WAVELENGTH_CONFIG } from '../utils/wavelengthConfig';

const Container = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 90vw;
  pointer-events: ${({ $isIdle }) => ($isIdle ? 'none' : 'auto')};
  flex: 1;

  ${({ $inline }) =>
    !$inline &&
    css`
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;

      @media (max-width: 1280px) {
        display: none;
      }
    `}
`;

const WavelengthButton = styled.button`
  background: ${({ $active, $color }) =>
    $active ? $color + '33' : 'rgba(0, 0, 0, 0.5)'};
  border: 1px solid
    ${({ $active, $color }) => ($active ? $color : 'rgba(255,255,255,0.15)')};
  border-radius: 4px;
  color: ${({ $active, $color }) =>
    $active ? $color : 'rgba(255,255,255,0.6)'};
  cursor: pointer;
  font-size: 11px;
  font-family: monospace;
  letter-spacing: 0.03em;
  padding: 4px 8px;
  line-height: 1.4;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ $color }) => $color + '22'};
    border-color: ${({ $color }) => $color + 'aa'};
    color: ${({ $color }) => $color};
  }
`;

const Label = styled.span`
  display: block;
  font-size: 11px;
  font-weight: 600;
`;

const ShortDesc = styled.span`
  display: block;
  font-size: 9px;
  opacity: 0.75;
  margin-top: 1px;
`;

export default function WavelengthSelector({
  wavelength,
  onWavelengthChange,
  inline,
}) {
  return (
    <Container $inline={inline}>
      {WAVELENGTH_CONFIG.map((w) => (
        <WavelengthButton
          key={w.id}
          $active={wavelength === w.id}
          $color={w.colorHex}
          title={w.description}
          onClick={() => onWavelengthChange(w.id)}>
          <Label>{w.label}</Label>
          <ShortDesc>{w.shortDesc}</ShortDesc>
        </WavelengthButton>
      ))}
    </Container>
  );
}

WavelengthSelector.propTypes = {
  wavelength: PropTypes.string.isRequired,
  onWavelengthChange: PropTypes.func.isRequired,
  isIdle: PropTypes.bool,
  inline: PropTypes.bool,
};
