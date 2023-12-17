import type { Baselayers, Layers } from '../../common/types/layers';
import { extractProperties } from '../../common/extractProperties';

export type CoordUnits = 'd' | 'dm' | 'dms';
type Order= Layers | {source: Layers, alpha: number}
type Settings = {
  readonly show: {
    crosshair: boolean
    navionicsDetails: boolean
    suncalc: boolean
  }
  tiles:{
    baselayers: Baselayers[]
    enabled: Partial<Record<Layers, boolean>>
    order: [Baselayers, ...Order[]]
  }
  units:{
    coords: CoordUnits
  }
}

const localStorageSettings: Settings = (() => {
  try {
    return JSON.parse(window.localStorage.getItem('settings') ?? '{}');
  }
  catch {
    return {};
  }
})();

const order: [Baselayers, ...Order[]] = [
  'osm',
  'openseamap',
  'navionics',
  { alpha: 0.5, source: 'vfdensity' },
];
export const settings: Settings = {
  show: extractProperties(localStorageSettings?.show, {
    crosshair: val => Boolean(val ?? true),
    navionicsDetails: Boolean,
    suncalc: Boolean,
  }),
  tiles: {
    baselayers: [
      '',
      'osm',
      'googlesat',
      'googlestreet',
      'googlehybrid',
      'gebco',
      'bingsat',
      'opentopomap',
      'worthit',
    ],
    enabled: Object.fromEntries(order
    .map(e => typeof e === 'string' ? e : e.source)
    .filter(e => e !== 'openseamap')
    .map(e => [e, Boolean(localStorageSettings?.tiles?.enabled?.[e] ?? true)])),

    order,
  },
  units: extractProperties(localStorageSettings?.units, {
    coords: (val) => ['d', 'dm', 'dms'].includes(val) ? val : 'dm',
  }),
};
const baselayer = localStorageSettings?.tiles?.order?.[0];
settings.tiles.order[0] = settings.tiles.baselayers.includes(baselayer) ?
  baselayer :
  'osm';
settings.tiles.enabled[settings.tiles.order[0]] = true;
