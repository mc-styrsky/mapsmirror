import { Settings } from '../../globals/settings';
import { IconButton } from '../../utils/htmlElements/iconButton';
import { MonoContainer } from '../../utils/htmlElements/monoContainer';

export class SuncalcToggle extends MonoContainer {
  static readonly listeners = new Set<() => void>();
  static {
    this.copyInstance<'a'>(new IconButton({
      active: () => Settings.show.suncalc,
      icon: 'sunrise',
      onclick: () => {
        Settings.show.suncalc = !Settings.show.suncalc;
        this.refresh();
      },
    }), this);
  }
  static refresh () {
    this.listeners.forEach(callback => callback());
  }
}
