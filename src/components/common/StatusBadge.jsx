import PropTypes from 'prop-types';
import styled, { keyframes, css } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const Badge = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  pointer-events: none;
  flex-shrink: 0;
  align-self: center;
  background: ${(p) =>
    p.$live ? 'rgba(100, 220, 180, 0.15)' : 'rgba(255, 180, 60, 0.15)'};
  border: 1px solid
    ${(p) => (p.$live ? 'rgba(100, 220, 180, 0.4)' : 'rgba(255, 180, 60, 0.4)')};
  color: ${(p) =>
    p.$live ? 'rgba(140, 255, 210, 1)' : 'rgba(255, 210, 100, 1)'};

  @media (max-width: 1280px) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  ${(p) =>
    p.$live &&
    css`
      &::before {
        content: '';
        display: inline-block;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: rgba(140, 255, 210, 1);
        margin-right: 0.4rem;
        animation: ${pulse} 2s infinite;
        vertical-align: middle;
      }
    `}
`;

export default function StatusBadge({
  isLive,
  isHistorical,
  stormMode,
  component: Component = Badge,
  className,
}) {
  return (
    <Component $live={isLive} className={className}>
      {isLive && 'Live'}
      {isHistorical && 'Historical'}
      {stormMode === 'storm' && 'G4–G5 Simulation'}
      {stormMode === 'substorm' && 'G1–G3 Simulation'}
    </Component>
  );
}

StatusBadge.propTypes = {
  isLive: PropTypes.bool,
  isHistorical: PropTypes.bool,
  stormMode: PropTypes.string,
  component: PropTypes.any,
  className: PropTypes.string,
};
