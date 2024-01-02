import { infoBox } from './containers/infoBox';
import { menuContainer } from './containers/menuContainer';
import { mouseContainer } from './containers/mouseContainer';
import { overlayContainer } from './containers/overlayContainer';
import { mapContainer } from './containers/tilesContainer';
import { inputListener } from './events/inputListener';
import { stylesheet } from './globals/stylesheet';
import { mainContainer } from './mainContainer';

mainContainer.clear();
mainContainer.append(
  stylesheet,
  mapContainer,
  overlayContainer,
  mouseContainer,
  infoBox,
  menuContainer,
);
mainContainer.refresh();

window.addEventListener('keydown', inputListener);
