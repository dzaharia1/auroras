import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledButton = styled.button`
  background: ${(props) =>
    props.$active ? 'rgba(20, 20, 30, 0.2)' : 'rgba(20, 20, 30, 0.4)'};
  border: ${(props) =>
    props.$active
      ? '1px solid rgba(100, 220, 180, 0.5)'
      : '1px solid rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  color: ${(props) =>
    props.$active ? 'rgba(140, 255, 210, 1)' : 'rgba(255, 255, 255, 0.8)'};
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: ${(props) => (props.$active ? '600' : '400')};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$align ? props.$align : 'center')};
  gap: 0.5rem;
  width: ${(props) => (props.$fullWidth ? '100%' : 'auto')};
  min-width: ${(props) => (props.$minWidth ? props.$minWidth : '120px')};
  box-sizing: border-box;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$active ? 'rgba(20, 20, 30, 0.2)' : 'rgba(20, 20, 30, 0.2)'};
    border-color: ${(props) =>
      props.$active ? 'rgba(100, 220, 180, 0.6)' : 'rgba(255, 255, 255, 0.2)'};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Button = ({ children, active, fullWidth, minWidth, align, ...props }) => {
  return (
    <StyledButton
      $active={active}
      $fullWidth={fullWidth}
      $minWidth={minWidth}
      $align={align}
      {...props}>
      {children}
    </StyledButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  active: PropTypes.bool,
  fullWidth: PropTypes.bool,
  minWidth: PropTypes.string,
  align: PropTypes.string,
};

Button.defaultProps = {
  active: false,
  fullWidth: false,
  minWidth: '120px',
  align: 'center',
};

export default Button;
