import { settings } from '../../globals/settings';
import { Container } from '../../utils/htmlElements/container';

class CoordsToggle extends Container<'a'> {
  static toString = () => {
    return {
      d: 'Dec',
      dm: 'D°M\'',
      dms: 'DMS',
    }[settings.units.coords];
  };

  constructor () {
    super('a', {
      classes: ['btn', 'btn-secondary'],
      onclick: () => {
        settings.units.coords = {
          d: 'dm' as const,
          dm: 'dms' as const,
          dms: 'd' as const,
        }[settings.units.coords] ?? 'dm';

        this.refresh();
      },
      role: 'button',
    });
  }

  readonly listeners = new Set<() => void>();

  refresh () {
    this.listeners.forEach(callback => callback());
    this.clear();
    this.append(CoordsToggle.toString());
  }
}

export const coordsToggle = new CoordsToggle();
