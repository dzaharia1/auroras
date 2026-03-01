import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Maximize, Minimize } from 'lucide-react';
import Button from '../common/Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
`;

const Label = styled.span`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 0.25rem;
`;

export default function FullscreenControl() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <Container>
      <Label>View</Label>
      <Button onClick={toggleFullscreen} minWidth="120px" align="flex-start">
        {isFullscreen ? (
          <>
            <Minimize size={18} style={{ marginRight: '8px' }} />
            <span>Normal</span>
          </>
        ) : (
          <>
            <Maximize size={18} style={{ marginRight: '8px' }} />
            <span>Fullscreen</span>
          </>
        )}
      </Button>
    </Container>
  );
}
