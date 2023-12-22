import { Container } from '../utils/htmlElements/container';
import { baselayerMenu } from './menu/baselayerMenu';
import { coordsToggle } from './menu/coordsToggle';
import { crosshairToggle } from './menu/crosshairToggle';
import { gotoMenu } from './menu/gotoMenu';
import { navionicsDetailsToggle } from './menu/navionicsDetailsToggle';
import { navionicsToggle } from './menu/navionicsToggle';
import { OverlayToggle } from './menu/overlayToggle';
import { savePosition } from './menu/savePosition';
import { suncalcToggle } from './menu/suncalcToggle';
import { vfdensityToggle } from './menu/vfdensityToggle';

class MenuContainer extends Container {
  constructor () {
    super(Container.from('div', {
      classes: ['d-flex', 'gap-2', 'm-2'],
      dataset: {
        bsTheme: 'dark',
      },
    }));
    this.append(
      baselayerMenu,
      Container.from('div', {
        classes: ['btn-group'],
        role: 'group',
      })
      .append(
        new OverlayToggle('openseamap'),
        vfdensityToggle,
        navionicsToggle,
        navionicsDetailsToggle,
        crosshairToggle,
        suncalcToggle,
        coordsToggle,
      ),
      gotoMenu,
      savePosition,
    );
  }
}

export const menuContainer = new MenuContainer();
