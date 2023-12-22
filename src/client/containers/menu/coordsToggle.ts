import { settings } from '../../globals/settings';
import { Container } from '../../utils/htmlElements/container';
import { mapContainer } from '../mapContainer';

export const coordsToggle = Container.from('a', {
  classes: ['btn', 'btn-secondary'],
  onclick: () => {
    settings.units.coords = {
      d: <const> 'dm',
      dm: <const> 'dms',
      dms: <const> 'd',
    }[settings.units.coords] ?? 'dm';

    coordsToggle.clear();
    coordsToggle.append({
      d: 'Dec',
      dm: 'D°M\'',
      dms: 'DMS',
    }[settings.units.coords]);
    mapContainer.redraw('coords changed');
  },
  role: 'button',
});

coordsToggle.append({
  d: 'Dec',
  dm: 'D°M\'',
  dms: 'DMS',
}[settings.units.coords]);
