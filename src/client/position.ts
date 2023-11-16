import { extractProperties } from '../common/extractProperties';


export const position = extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  canvas: () => ({ x: 0, y: 0, z: 0 }),
  mouse: () => ({
    down: false,
    x: 0,
    y: 0,
  }),
  source: val => String(val ?? 'osm'),
  tiles: () => 1,
  ttl: val => Number(val ?? 0),
  user: () => ({
    accuracy: 0,
    latitude: 0,
    longitude: 0,
    timestamp: 0,
  }),
  x: val => Number(val ?? 2),
  y: val => Number(val ?? 2),
  z: val => Number(val ?? 2),
});

position.canvas = {
  x: position.x,
  y: position.y,
  z: position.z,
};
position.tiles = 1 << position.z;
