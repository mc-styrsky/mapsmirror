import { InfoBox } from './containers/infoBox';
import { MenuContainer } from './containers/menuContainer';
import { MouseContainer } from './containers/mouseContainer';
import { OverlayContainer } from './containers/overlayContainer';
import { TilesContainer } from './containers/tilesContainer';
import { inputListener } from './events/inputListener';
import { Stylesheet } from './globals/stylesheet';
import { MainContainer } from './mainContainer';

MainContainer.clear();
MainContainer.append(
  Stylesheet,
  TilesContainer.instance,
  OverlayContainer,
  MouseContainer,
  InfoBox,
  MenuContainer,
);
MainContainer.refresh();

window.addEventListener('keydown', inputListener);
