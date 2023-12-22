import { navionicsDetails } from '../../globals/navionicsDetails';
import { position } from '../../globals/position';
import { settings } from '../../globals/settings';
import { IconButton } from '../../utils/htmlElements/iconButton';

export const navionicsDetailsToggle = new IconButton({
  active: () => settings.show.navionicsDetails,
  icon: 'question-circle',
  onclick: () => {
    const newActive = !settings.show.navionicsDetails;
    settings.show.navionicsDetails = newActive;
    navionicsDetails.fetch(position);
  },
});
