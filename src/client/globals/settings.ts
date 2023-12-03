import type { Baselayers, Layers } from '../../common/types/layers';

type Order= Layers | {source: Layers, alpha: number}

const order: Order[] = [
  'osm',
  'openseamap',
  'navionics',
  { alpha: 0.5, source: 'vfdensity' },
];
export const settings: {
  tiles:{
    baselayers: Baselayers[]
    enabled: Partial<Record<Layers, boolean>>
    order: Order[]
  }
} = {
  tiles: {
    baselayers: [
      '',
      'osm',
      'googlesat',
      'googlestreet',
      'googlehybrid',
      'gebco',
      'bingsat',
      'bluemarble',
    ],
    enabled: Object.fromEntries(order
    .map(e => typeof e === 'string' ? e : e.source)
    .filter(e => e !== 'openseamap')
    .map(e => [e, true])),
    order,
  },
};
