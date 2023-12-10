import { Size } from './boundingRect';
import { infoBox } from './containers/infoBox';
import { mapContainer } from './containers/mapContainer';
import { menuContainer } from './containers/menuContainer';
import { overlayContainer } from './containers/overlayContainer';
import { onchange } from './events/oninput';
import { onmouse } from './events/onmouse';
import { redraw } from './redraw';
import { createHTMLElement } from './utils/createHTMLElement';

const {
  container: containerId = '',
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());
const container = document.getElementById(containerId) ?? createHTMLElement({ tag: 'div' });

export const boundingRect = new Size(container);

container.innerHTML = '';
container.append(mapContainer, overlayContainer, infoBox, menuContainer);

window.addEventListener('keydown', onchange);
window.addEventListener('wheel', onchange);
window.addEventListener('mousemove', onmouse);
window.addEventListener('mousedown', onmouse);
window.addEventListener('mouseup', onmouse);
window.addEventListener('resize', () => {
  boundingRect.refresh();
  redraw('resize');
});

redraw('initial');
