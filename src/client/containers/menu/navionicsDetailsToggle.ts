import { navionicsDetails } from '../../globals/navionicsDetails';
import { position } from '../../globals/position';
import { settings } from '../../globals/settings';
import { iconButton } from './iconButton';

export const navionicsDetailsToggle = iconButton({
  active: () => settings.navionicsDetails.show,
  onclick: () => {
    const newActive = !settings.navionicsDetails.show;
    settings.navionicsDetails.show = newActive;
    navionicsDetails.fetch(position);
  },
  src: 'bootstrap-icons-1.11.2/question-circle.svg',
});
