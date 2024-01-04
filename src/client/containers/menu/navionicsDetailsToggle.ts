import { position } from '../../globals/position';
import { settings } from '../../globals/settings';
import { IconButton } from '../../utils/htmlElements/iconButton';
import { navionicsDetails } from '../infoBox/navionicsDetails';

class NavionicsDetailsToggle extends IconButton {
  constructor () {
    super({
      active: () => settings.show.navionicsDetails,
      icon: 'question-circle',
      onclick: () => {
        const newActive = !settings.show.navionicsDetails;
        settings.show.navionicsDetails = newActive;
        void navionicsDetails.fetch(position);
      },
    });
    this.refresh();
  }

  readonly listeners = new Set<() => void>();
  refresh () {
    this.listeners.forEach(callback => callback());
  }
}

export const navionicsDetailsToggle = new NavionicsDetailsToggle();
