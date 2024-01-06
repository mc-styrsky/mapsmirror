import { Container } from '../utils/htmlElements/container';
import { MonoContainer } from '../utils/htmlElements/monoContainer';
import { BaselayerMenu } from './menu/baselayerMenu';
import { CoordsToggle } from './menu/coordsToggle';
import { CrosshairToggle } from './menu/crosshairToggle';
import { GotoMenu } from './menu/gotoMenu';
import { NavionicsDetailsToggle } from './menu/navionicsDetailsToggle';
import { NavionicsToggle } from './menu/navionicsToggle';
import { OverlayToggle } from './menu/overlayToggle';
import { SuncalcToggle } from './menu/suncalcToggle';
import { VfdensityToggle } from './menu/vfdensityToggle';

export class MenuContainer extends MonoContainer {
  static {
    this.copyInstance(new Container('div', {
      classes: ['d-flex', 'gap-2', 'm-2'],
      dataset: {
        bsTheme: 'dark',
      },
    }), this);
    this.append(
      BaselayerMenu,
      new Container('div', {
        classes: ['btn-group'],
        role: 'group',
      })
      .append(
        new OverlayToggle('openseamap'),
        VfdensityToggle,
        NavionicsToggle,
        NavionicsDetailsToggle,
        CrosshairToggle,
        SuncalcToggle,
        CoordsToggle,
      ),
      new GotoMenu(),
    );
  }
}
