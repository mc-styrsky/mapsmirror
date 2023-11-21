import type { XYZ } from '../common/types/xyz';
import { extractProperties } from '../common/extractProperties';


const { source, ttl, x, y, z } = extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  source: val => String(val ?? 'osm'),
  ttl: val => parseInt(val ?? 0),
  x: val => parseFloat(val ?? 2),
  y: val => parseFloat(val ?? 2),
  z: val => parseInt(val ?? 2),
});

export const position = {
  map: <XYZ> { x, y, z },
  mouse: {
    down: false,
    x: 0,
    y: 0,
  },
  show: { crosshairs: true },
  source,
  tiles: 1 << z,
  ttl,
  user: {
    accuracy: 0,
    latitude: 0,
    longitude: 0,
    timestamp: 0,
  },
  x,
  y,
  z,
};
