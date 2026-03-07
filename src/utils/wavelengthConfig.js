// AIA false-color convention colors for each wavelength
// These match the standard SDO/AIA color palette used by Helioviewer
export const WAVELENGTH_CONFIG = [
  {
    id: '94',
    label: '94 Å',
    description: 'Flaring regions (Fe XVIII, ~6.3 MK)',
    shortDesc: 'Flaring regions',
    colorHex: '#7cff40',
    prominenceVisible: false,
  },
  {
    id: '131',
    label: '131 Å',
    description: 'Flaring regions (Fe VIII/XXI, ~0.4/10 MK)',
    shortDesc: 'Flaring regions',
    colorHex: '#4090ff',
    prominenceVisible: false,
  },
  {
    id: '171',
    label: '171 Å',
    description: 'Corona / Coronal loops (Fe IX, ~0.6 MK)',
    shortDesc: 'Corona / Coronal loops',
    colorHex: '#e8c060',
    prominenceVisible: true,
  },
  {
    id: '193',
    label: '193 Å',
    description: 'Corona / Hot flare plasma (Fe XII/XXIV, ~1.2/20 MK)',
    shortDesc: 'Corona / Hot flare plasma',
    colorHex: '#b8c090',
    prominenceVisible: false,
  },
  {
    id: '211',
    label: '211 Å',
    description: 'Active regions (Fe XIV, ~2 MK)',
    shortDesc: 'Active regions',
    colorHex: '#c070c0',
    prominenceVisible: false,
  },
  {
    id: '304',
    label: '304 Å',
    description: 'Chromosphere / Prominences (He II, ~0.05 MK)',
    shortDesc: 'Chromosphere / Prominences',
    colorHex: '#ff4040',
    prominenceVisible: true,
  },
  {
    id: '335',
    label: '335 Å',
    description: 'Active regions (Fe XVI, ~2.5 MK)',
    shortDesc: 'Active regions',
    colorHex: '#4080c0',
    prominenceVisible: false,
  },
  {
    id: '1600',
    label: '1600 Å',
    description: 'Transition region (C IV, ~0.1 MK)',
    shortDesc: 'Transition region',
    colorHex: '#c0d040',
    prominenceVisible: false,
  },
  {
    id: '1700',
    label: '1700 Å',
    description: 'Photosphere / Temperature minimum (~5000 K)',
    shortDesc: 'Photosphere',
    colorHex: '#d08080',
    prominenceVisible: false,
  },
];

export const WAVELENGTH_MAP = Object.fromEntries(
  WAVELENGTH_CONFIG.map((w) => [w.id, w]),
);

export const DEFAULT_WAVELENGTH = '193';
