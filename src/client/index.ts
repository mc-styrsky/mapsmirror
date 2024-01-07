import { InfoBox } from './containers/infoBox';
import { MenuContainer } from './containers/menuContainer';
import { MouseContainer } from './containers/mouseContainer';
import { OverlayContainer } from './containers/overlayContainer';
import { ScaleContainer } from './containers/scaleContainer';
import { TilesContainer } from './containers/tilesContainer';
import { inputListener } from './events/inputListener';
import { Stylesheet } from './globals/stylesheet';
import { MainContainer } from './mainContainer';

MainContainer.clear();
MainContainer.append(
  Stylesheet,
  TilesContainer,
  OverlayContainer,
  ScaleContainer,
  MouseContainer,
  InfoBox,
  MenuContainer,
);
MainContainer.refresh();

window.addEventListener('keydown', inputListener);
