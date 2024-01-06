import { Container } from '../utils/htmlElements/container';
import { baselayerMenu } from './menu/baselayerMenu';
import { coordsToggle } from './menu/coordsToggle';
import { crosshairToggle } from './menu/crosshairToggle';
import { GotoMenu } from './menu/gotoMenu';
import { navionicsDetailsToggle } from './menu/navionicsDetailsToggle';
import { navionicsToggle } from './menu/navionicsToggle';
import { OverlayToggle } from './menu/overlayToggle';
import { suncalcToggle } from './menu/suncalcToggle';
import { vfdensityToggle } from './menu/vfdensityToggle';

class MenuContainer extends Container {
  constructor () {
    super('div', {
      classes: ['d-flex', 'gap-2', 'm-2'],
      dataset: {
        bsTheme: 'dark',
      },
    });
    this.append(
      baselayerMenu,
      new Container('div', {
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
      new GotoMenu(),
    );
  }
}

export const menuContainer = new MenuContainer();
