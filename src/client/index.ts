import { infoBox } from './containers/infoBox';
import { mapContainer } from './containers/mapContainer';
import { menuContainer } from './containers/menuContainer';
import { overlayContainer } from './containers/overlayContainer';
import { onchange } from './events/oninput';
import { onmouse } from './events/onmouse';
import { redraw } from './redraw';
const {
  container: containerId = '',
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());

export const container = document.getElementById(containerId);
if (container) {
  container.innerHTML = '';
  container.append(mapContainer, overlayContainer, infoBox, menuContainer);
}

export const tileSize = 256;

if (container) {
  window.addEventListener('keydown', onchange);
  window.addEventListener('wheel', onchange);
  window.addEventListener('mousemove', onmouse);
  window.addEventListener('resize', onchange);

  redraw('initial');
}
