import { navionicsDetails } from '../../globals/navionicsDetails';
import { position } from '../../globals/position';
import { settings } from '../../globals/settings';
import { iconButton } from './iconButton';

export const navionicsDetailsToggle = iconButton({
  active: () => settings.show.navionicsDetails,
  icon: 'question-circle',
  onclick: () => {
    const newActive = !settings.show.navionicsDetails;
    settings.show.navionicsDetails = newActive;
    navionicsDetails.fetch(position);
  },
});
