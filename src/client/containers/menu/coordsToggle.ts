import { settings } from '../../globals/settings';
import { redraw } from '../../redraw';
import { createHTMLElement } from '../../utils/createHTMLElement';

export const coordsToggle = createHTMLElement({
  classes: ['btn', 'btn-secondary'],
  onclick: () => {
    settings.units.coords = {
      d: <const> 'dm',
      dm: <const> 'dms',
      dms: <const> 'd',
    }[settings.units.coords] ?? 'dm';
    coordsToggle.innerText = {
      d: 'Dec',
      dm: 'D°M\'',
      dms: 'DMS',
    }[settings.units.coords];
    redraw('coords changed');
  },
  role: 'button',
  tag: 'a',
  zhilds: [{
    d: 'Dec',
    dm: 'D°M\'',
    dms: 'DMS',
  }[settings.units.coords]],
});
