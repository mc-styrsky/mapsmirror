import { extractProperties } from '../common/extractProperties';
import { onchange } from './onchange';
import { onmousemove } from './onmousemove';
import { redraw } from './redraw';
const {
  container: containerId = '',
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());

export const container = document.getElementById(containerId);

export const position = extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  mouse: () => ({
    down: false,
    x: 0,
    y: 0,
  }),
  source: val => String(val ?? 'osm'),
  tiles: () => 1,
  ttl: val => Number(val ?? 0),
  x: val => Number(val ?? 2),
  y: val => Number(val ?? 2),
  z: val => Number(val ?? 2),
});
position.tiles = 1 << position.z;

export const tileSize = 256;

if (container) {
  window.addEventListener('keydown', onchange);
  window.addEventListener('wheel', onchange);
  window.addEventListener('mousedown', onchange);
  window.addEventListener('mouseup', onchange);
  window.addEventListener('mousemove', onmousemove);

  redraw();
}
