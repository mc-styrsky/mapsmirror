import { Settings } from '../../globals/settings';
import { Container } from '../../utils/htmlElements/container';
import { MonoContainer } from '../../utils/htmlElements/monoContainer';

export class CoordsToggle extends MonoContainer<'a'> {
  static readonly listeners = new Set<() => void>();
  static {
    this.copyInstance(new Container('a', {
      classes: ['btn', 'btn-secondary'],
      onclick: () => {
        Settings.units.coords = {
          d: 'dm' as const,
          dm: 'dms' as const,
          dms: 'd' as const,
        }[Settings.units.coords] ?? 'dm';

        this.refresh();
      },
      role: 'button',
    }), this);
  }

  static toString = () => {
    return {
      d: 'Dec',
      dm: 'D°M\'',
      dms: 'DMS',
    }[Settings.units.coords];
  };

  static refresh () {
    this.listeners.forEach(callback => callback());
    this.clear();
    this.append(CoordsToggle.toString());
  }
}
