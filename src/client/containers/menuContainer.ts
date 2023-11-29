import { createHTMLElement } from '../utils/createHTMLElement';
import { baselayerMenu } from './menu/baselayerMenu';
import { coordsToggle } from './menu/coordsToggle';
import { crosshairToggle } from './menu/crosshairToggle';
import { navionicsToggle } from './menu/navionicsToggle';
import { overlayToggle } from './menu/overlayToggle';
import { vfdensityToggle } from './menu/vfdensityToggle';


export const menuContainer = createHTMLElement({
  classes: ['d-flex', 'd-flex-row', 'gap-2', 'm-2'],
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
  ],
});
