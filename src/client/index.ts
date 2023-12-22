import { Size } from './boundingRect';
import { infoBox } from './containers/infoBox';
import { mapContainer } from './containers/mapContainer';
import { menuContainer } from './containers/menuContainer';
import { mouseContainer } from './containers/mouseContainer';
import { overlayContainer } from './containers/overlayContainer';
import { inputListener } from './events/inputListener';
import { Container } from './utils/htmlElements/container';

const {
  container: containerId = '',
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());
const container = Container.from(document.getElementById(containerId) ?? Container.from('div').html);

export const boundingRect = new Size(container);

container.clear();
container.append(
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
