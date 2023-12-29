import { Size } from './boundingRect';
import { infoBox } from './containers/infoBox';
import { menuContainer } from './containers/menuContainer';
import { mouseContainer } from './containers/mouseContainer';
import { overlayContainer } from './containers/overlayContainer';
import { mapContainer } from './containers/tilesContainer';
import { inputListener } from './events/inputListener';
import { stylesheet } from './globals/stylesheet';
import { Container } from './utils/htmlElements/container';

const {
  container: containerId = '',
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());
const container = Container.from(document.getElementById(containerId) ?? Container.from('div').html);

export const boundingRect = new Size(container);

container.clear();
container.append(
  stylesheet,
  mapContainer,
  overlayContainer,
  mouseContainer,
  infoBox,
  menuContainer,
);

window.addEventListener('keydown', inputListener);
window.addEventListener('resize', () => {
  boundingRect.refresh();
  mapContainer.redraw('resize');
});

mapContainer.rebuild('initial');

console.log(stylesheet)
