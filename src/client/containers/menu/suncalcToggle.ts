import { settings } from '../../globals/settings';
import { IconButton } from '../../utils/htmlElements/iconButton';

export const suncalcToggle = new IconButton({
  active: () => settings.show.suncalc,
  icon: 'sunrise',
  onclick: () => settings.show.suncalc = !settings.show.suncalc,
});
