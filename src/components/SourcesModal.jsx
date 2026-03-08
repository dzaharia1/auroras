import PropTypes from 'prop-types';
import styled from 'styled-components';
import { X, ExternalLink } from 'lucide-react';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: auto;
`;

const ModalContent = styled.div`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  padding: 2rem;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  transition: color 0.2s;

  &:hover {
    color: white;
  }
`;

const ModalTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
`;

const SourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
  flex: 1;
`;

const SourceItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const SourceName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: white;
`;

const SourceDesc = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
`;

const SourceLink = styled.a`
  color: #8cdcd2;
  font-size: 0.8rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  width: fit-content;
  margin-top: 0.2rem;

  &:hover {
    text-decoration: underline;
  }
`;

const sources = [
  {
    name: 'NOAA Space Weather Prediction Center (SWPC)',
    description:
      'Real-time solar wind plasma, magnetometer data, Kp-index, OVATION aurora models, solar active regions, and solar events (filaments, prominences).',
    link: 'https://www.swpc.noaa.gov/',
  },
  {
    name: 'GFZ German Research Centre for Geosciences',
    description:
      'Definitive historical Kp-index data for year-by-year simulations.',
    link: 'https://kp.gfz.de/',
  },
  {
    name: 'Helioviewer',
    description:
      'Real-time solar imagery at multiple wavelengths from SDO AIA and HMI instruments.',
    link: 'https://helioviewer.org/',
  },
  {
    name: 'NASA Blue Marble Next Generation',
    description:
      'High-resolution base topography and monthly seasonal earth textures.',
    link: 'https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography/',
  },
  {
    name: 'Claude Code',
    description: 'AI coding assistance.',
    link: 'https://claude.ai/',
  },
  {
    name: 'Google Antigravity',
    description: 'AI coding assistance.',
    link: 'https://antigravity.google/',
  },
];

export default function SourcesModal({ onClose }) {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>
        <ModalTitle>Data Sources</ModalTitle>
        <SourceList>
          {sources.map((source, i) => (
            <SourceItem key={i}>
              <SourceName>{source.name}</SourceName>
              <SourceDesc>{source.description}</SourceDesc>
              <SourceLink
                href={source.link}
                target="_blank"
                rel="noopener noreferrer">
                Visit Website <ExternalLink size={12} />
              </SourceLink>
            </SourceItem>
          ))}
        </SourceList>
      </ModalContent>
    </ModalOverlay>
  );
}

SourcesModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
