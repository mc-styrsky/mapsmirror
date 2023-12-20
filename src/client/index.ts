import { Size } from './boundingRect';
import { infoBox } from './containers/infoBox';
import { mapContainer } from './containers/mapContainer';
import { menuContainer } from './containers/menuContainer';
import { overlayContainer } from './containers/overlayContainer';
import { oninput } from './events/oninput';
import { onmouse } from './events/onmouse';
import { createHTMLElement } from './utils/createHTMLElement';

const {
  container: containerId = '',
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());
const container = document.getElementById(containerId) ?? createHTMLElement('div');

export const boundingRect = new Size(container);

container.innerHTML = '';
container.append(mapContainer.html, overlayContainer, infoBox, menuContainer);

window.addEventListener('keydown', oninput);
window.addEventListener('wheel', oninput);
window.addEventListener('mousemove', onmouse);
window.addEventListener('mousedown', onmouse);
window.addEventListener('mouseup', onmouse);
window.addEventListener('resize', () => {
  boundingRect.refresh();
  mapContainer.redraw('resize');
});

mapContainer.redraw('initial');
