import { settings } from '../../globals/settings';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { mapContainer } from '../mapContainer';

export const coordsToggle = createHTMLElement('a', {
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
    mapContainer.redraw('coords changed');
  },
  role: 'button',
  zhilds: [{
    d: 'Dec',
    dm: 'D°M\'',
    dms: 'DMS',
  }[settings.units.coords]],
});
