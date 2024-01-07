import { position } from '../../globals/position';
import { Settings } from '../../globals/settings';
import { IconButton } from '../../utils/htmlElements/iconButton';
import { MonoContainer } from '../../utils/htmlElements/monoContainer';
import { NavionicsDetails } from '../infoBox/navionicsDetails';

export class NavionicsDetailsToggle extends MonoContainer {
  static readonly listeners = new Set<() => void>();
  static refresh () {
    this.listeners.forEach(callback => callback());
  }
  static {
    this.copyInstance<'a'>(new IconButton({
      active: () => Settings.show.navionicsDetails,
      icon: 'question-circle',
      onclick: () => {
        const newActive = !Settings.show.navionicsDetails;
        Settings.show.navionicsDetails = newActive;
        void NavionicsDetails.fetch(position);
        this.refresh();
      },
    }), this);
    this.refresh();
  }
}
