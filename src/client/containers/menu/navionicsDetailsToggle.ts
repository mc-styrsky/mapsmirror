import { navionicsDetails } from '../../globals/navionicsDetails';
import { position } from '../../globals/position';
import { settings } from '../../globals/settings';
import { iconButton } from './iconButton';

export const navionicsDetailsToggle = iconButton({
  active: () => settings.show.navionicsDetails,
  onclick: () => {
    const newActive = !settings.show.navionicsDetails;
    settings.show.navionicsDetails = newActive;
    navionicsDetails.fetch(position);
  },
  src: 'bootstrap-icons-1.11.2/question-circle.svg',
});
