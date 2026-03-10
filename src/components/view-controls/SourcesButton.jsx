import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Info } from 'lucide-react';

const StyledButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.4rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export default function SourcesButton({ onClick }) {
  return (
    <StyledButton onClick={onClick}>
      <Info size={14} />
      Sources
    </StyledButton>
  );
}

SourcesButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
