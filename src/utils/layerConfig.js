export const LAYER_CONFIG = {
  aurora: {
    id: 'aurora',
    label: 'Aurora Probability',
    views: ['earth'],
    dataField: 'ovation',
    defaultEnabled: true,
  },
  kp: {
    id: 'kp',
    label: 'Kp Index',
    views: ['earth'],
    dataField: 'kp',
    defaultEnabled: false,
  },
  bz: {
    id: 'bz',
    label: 'IMF Bz',
    views: ['earth'],
    dataField: 'solarWind',
    defaultEnabled: false,
  },
  solarWind: {
    id: 'solarWind',
    label: 'Solar Wind',
    views: ['earth'],
    dataField: 'solarWind',
    defaultEnabled: false,
  },
  dst: {
    id: 'dst',
    label: 'Dst Index',
    views: ['earth'],
    dataField: 'dst',
    defaultEnabled: false,
  },
  hemisphericPower: {
    id: 'hemisphericPower',
    label: 'Hemispheric Power',
    views: ['earth'],
    dataField: 'hemisphericPower',
    defaultEnabled: false,
  },
  solarFlares: {
    id: 'solarFlares',
    label: 'Solar Flare Alerts',
    views: ['sun'],
    dataField: 'xray',
    defaultEnabled: true,
  },
  solarCycle: {
    id: 'solarCycle',
    label: 'Solar Cycle',
    views: ['sun'],
    dataField: null,
    defaultEnabled: false,
  },
  solarWindOrigin: {
    id: 'solarWindOrigin',
    label: 'Solar Wind Origin',
    views: ['sun'],
    dataField: 'solarWind',
    defaultEnabled: false,
  },
  activeRegionOutlines: {
    id: 'activeRegionOutlines',
    label: 'Active Region Outlines',
    views: ['sun'],
    dataField: null,
    defaultEnabled: true,
  },
  prominenceOutlines: {
    id: 'prominenceOutlines',
    label: 'Prominence Outlines',
    views: ['sun'],
    dataField: null,
    defaultEnabled: false,
    wavelengthGated: ['171', '304'],
  },
};

export const DEFAULT_LAYERS = Object.fromEntries(
  Object.values(LAYER_CONFIG).map((l) => [l.id, l.defaultEnabled]),
);
