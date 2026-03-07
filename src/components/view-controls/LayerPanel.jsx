import { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layers } from 'lucide-react';
import { useLayerContext } from '../../context/LayerContext';
import { LAYER_CONFIG } from '../../utils/layerConfig';

const WAVELENGTHS = [
  { value: '193', label: '193 Å', desc: 'Corona / CMEs' },
  { value: '304', label: '304 Å', desc: 'Chromosphere' },
  { value: '171', label: '171 Å', desc: 'Quiet Sun' },
  { value: 'magnetogram', label: 'HMI', desc: 'Magnetic Field' },
];

const Trigger = styled.button`
  background: rgba(10, 10, 20, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.45rem 0.9rem;
  font-size: 0.8rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: white;
  }
`;

const Panel = styled.div`
  position: absolute;
  top: calc(2rem + 40px);
  right: 2rem;
  background: rgba(10, 10, 20, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 0.75rem 0;
  min-width: 200px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 30;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const LayerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  gap: 1rem;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const LayerLabel = styled.span`
  font-size: 0.8rem;
  font-family: 'Inter', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.02em;
`;

const Toggle = styled.div`
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: ${(p) =>
    p.$on ? 'rgba(100, 220, 180, 0.8)' : 'rgba(255, 255, 255, 0.15)'};
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${(p) => (p.$on ? '16px' : '2px')};
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 0.4rem 0;
`;

const SectionLabel = styled.div`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem 0.2rem;
`;

const WavelengthRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 1rem;
  cursor: pointer;
  transition: background 0.15s ease;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const WavelengthLabel = styled.span`
  font-size: 0.78rem;
  font-family: 'Inter', sans-serif;
  color: rgba(255, 255, 255, 0.8);
`;

const WavelengthDesc = styled.span`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
  flex: 1;
  text-align: right;
`;

const RadioDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid ${(p) => (p.$active ? 'rgba(100, 220, 180, 0.9)' : 'rgba(255,255,255,0.25)')};
  background: ${(p) => (p.$active ? 'rgba(100, 220, 180, 0.9)' : 'transparent')};
  flex-shrink: 0;
  transition: all 0.15s ease;
`;

export default function LayerPanel({ activeView }) {
  const [open, setOpen] = useState(false);
  const { layers, toggleLayer, sunWavelength, setSunWavelength } = useLayerContext();

  const viewLayers = Object.values(LAYER_CONFIG).filter((l) =>
    l.views.includes(activeView),
  );

  return (
    <>
      <Trigger onClick={() => setOpen((o) => !o)}>
        <Layers size={14} />
        Layers
      </Trigger>

      {open && (
        <Panel>
          {viewLayers.map((layer, i) => (
            <div key={layer.id}>
              {i > 0 && <Divider />}
              <LayerRow onClick={() => toggleLayer(layer.id)}>
                <LayerLabel>{layer.label}</LayerLabel>
                <Toggle $on={layers[layer.id]} />
              </LayerRow>
            </div>
          ))}

          {activeView === 'sun' && (
            <>
              <Divider />
              <SectionLabel>SDO Image</SectionLabel>
              {WAVELENGTHS.map((w) => (
                <WavelengthRow key={w.value} onClick={() => setSunWavelength(w.value)}>
                  <RadioDot $active={sunWavelength === w.value} />
                  <WavelengthLabel>{w.label}</WavelengthLabel>
                  <WavelengthDesc>{w.desc}</WavelengthDesc>
                </WavelengthRow>
              ))}
            </>
          )}
        </Panel>
      )}
    </>
  );
}

LayerPanel.propTypes = {
  activeView: PropTypes.string.isRequired,
};
