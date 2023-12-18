import { createHTMLElement } from '../utils/createHTMLElement';
import { baselayerMenu } from './menu/baselayerMenu';
import { coordsToggle } from './menu/coordsToggle';
import { crosshairToggle } from './menu/crosshairToggle';
import { gotoMenu } from './menu/gotoMenu';
import { navionicsDetailsToggle } from './menu/navionicsDetailsToggle';
import { navionicsToggle } from './menu/navionicsToggle';
import { overlayToggle } from './menu/overlayToggle';
import { savePosition } from './menu/savePosition';
import { suncalcToggle } from './menu/suncalcToggle';
import { vfdensityToggle } from './menu/vfdensityToggle';


export const menuContainer = createHTMLElement({
  classes: ['d-flex', 'gap-2', 'm-2'],
  dataset: {
    bsTheme: 'dark',
  },
  tag: 'div',
  zhilds: [
    baselayerMenu.toHtml(),
    createHTMLElement({
      classes: ['btn-group'],
      role: 'group',
      tag: 'div',
      zhilds: [
        overlayToggle('openseamap'),
        vfdensityToggle,
        navionicsToggle,
        navionicsDetailsToggle,
        crosshairToggle,
        suncalcToggle,
        coordsToggle,
      ],
    }),
    gotoMenu,
    savePosition,
  ],
});
