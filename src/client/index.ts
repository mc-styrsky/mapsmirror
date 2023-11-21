import { infoBox } from './containers/infoBox';
import { mapContainer } from './containers/mapContainer';
import { overlayContainer } from './containers/overlayContainer';
import { onchange } from './onchange';
import { onmousemove } from './onmousemove';
import { redraw } from './redraw';
const {
  container: containerId = '',
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());

export const container = document.getElementById(containerId);
if (container) {
  container.innerHTML = '';
  container.append(mapContainer, overlayContainer, infoBox);
}

export const tileSize = 256;

if (container) {
  window.addEventListener('keydown', onchange);
  window.addEventListener('wheel', onchange);
  window.addEventListener('mousedown', onchange);
  window.addEventListener('mouseup', onchange);
  window.addEventListener('mousemove', onmousemove);
  window.addEventListener('resize', onchange);

  redraw();
}
