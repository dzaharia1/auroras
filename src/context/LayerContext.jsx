import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_LAYERS } from '../utils/layerConfig';

const STORAGE_KEY = 'sw_layers';

function loadLayers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Object.fromEntries(
        Object.keys(DEFAULT_LAYERS).map((id) => [
          id,
          id in parsed ? Boolean(parsed[id]) : DEFAULT_LAYERS[id],
        ]),
      );
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_LAYERS };
}

const LayerContext = createContext(null);

export function LayerProvider({ children }) {
  const [layers, setLayers] = useState(loadLayers);
  const [sunWavelength, setSunWavelength] = useState('193');

  const toggleLayer = useCallback((layerId) => {
    setLayers((prev) => {
      const next = { ...prev, [layerId]: !prev[layerId] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setLayer = useCallback((layerId, enabled) => {
    setLayers((prev) => {
      const next = { ...prev, [layerId]: enabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetLayers = useCallback(() => {
    const defaults = { ...DEFAULT_LAYERS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    setLayers(defaults);
  }, []);

  return (
    <LayerContext.Provider value={{ layers, toggleLayer, setLayer, resetLayers, sunWavelength, setSunWavelength }}>
      {children}
    </LayerContext.Provider>
  );
}

LayerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useLayerContext() {
  const ctx = useContext(LayerContext);
  if (!ctx) throw new Error('useLayerContext must be used inside LayerProvider');
  return ctx;
}
