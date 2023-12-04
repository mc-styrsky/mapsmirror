import { createHTMLElement } from '../utils/createHTMLElement';
import { baselayerMenu } from './menu/baselayerMenu';
import { coordsToggle } from './menu/coordsToggle';
import { crosshairToggle } from './menu/crosshairToggle';
import { gotoMenu } from './menu/gotoMenu';
import { navionicsToggle } from './menu/navionicsToggle';
import { overlayToggle } from './menu/overlayToggle';
import { savePosition } from './menu/savePosition';
import { vfdensityToggle } from './menu/vfdensityToggle';


export const menuContainer = createHTMLElement({
  classes: ['d-flex', 'd-flex-row', 'gap-2', 'm-2'],
  dataset: {
    bsTheme: 'dark',
  },
  tag: 'div',
  zhilds: [
    baselayerMenu,
    createHTMLElement({
      classes: ['btn-group'],
      role: 'group',
      tag: 'div',
      zhilds: [
        overlayToggle('openseamap'),
        vfdensityToggle,
        navionicsToggle,
        crosshairToggle,
        coordsToggle,
      ],
    }),
    gotoMenu,
    savePosition,
  ],
});
