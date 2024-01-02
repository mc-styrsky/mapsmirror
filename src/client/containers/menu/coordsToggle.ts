import { settings } from '../../globals/settings';
import { Container } from '../../utils/htmlElements/container';

class CoordsToggle extends Container {
  static toString = () => {
    return {
      d: 'Dec',
      dm: 'D°M\'',
      dms: 'DMS',
    }[settings.units.coords];
  };

  constructor () {
    super(Container.from('a', {
      classes: ['btn', 'btn-secondary'],
      onclick: () => {
        settings.units.coords = {
          d: <const> 'dm',
          dm: <const> 'dms',
          dms: <const> 'd',
        }[settings.units.coords] ?? 'dm';

        this.refresh();
      },
      role: 'button',
    }));
  }

  readonly listeners = new Set<() => void>();

  refresh () {
    this.listeners.forEach(callback => callback());
    this.clear();
    this.append(CoordsToggle.toString());
  }
}

export const coordsToggle = new CoordsToggle();
