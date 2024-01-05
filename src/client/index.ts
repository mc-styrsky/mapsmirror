import { infoBox } from './containers/infoBox';
import { menuContainer } from './containers/menuContainer';
import { mouseContainer } from './containers/mouseContainer';
import { overlayContainer } from './containers/overlayContainer';
import { TilesContainer } from './containers/tilesContainer';
import { inputListener } from './events/inputListener';
import { Stylesheet } from './globals/stylesheet';
import { mainContainer } from './mainContainer';

mainContainer.clear();
mainContainer.append(
  Stylesheet,
  TilesContainer.instance,
  overlayContainer,
  mouseContainer,
  infoBox,
  menuContainer,
);
mainContainer.refresh();

window.addEventListener('keydown', inputListener);
