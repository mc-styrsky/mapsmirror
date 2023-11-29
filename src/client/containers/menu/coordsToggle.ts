import { units } from '../../globals/units';
import { redraw } from '../../redraw';
import { createHTMLElement } from '../../utils/createHTMLElement';

export const coordsToggle = createHTMLElement({
  classes: ['btn', 'btn-secondary'],
  onclick: () => {
    units.coords = {
      d: <const> 'dm',
      dm: <const> 'dms',
      dms: <const> 'd',
    }[units.coords] ?? 'dm';
    coordsToggle.innerText = {
      d: 'Dec',
      dm: 'D°M\'',
      dms: 'DMS',
    }[units.coords];
    redraw('coords changed');
  },
  role: 'button',
  tag: 'a',
  zhilds: [{
    d: 'Dec',
    dm: 'D°M\'',
    dms: 'DMS',
  }[units.coords]],
});
