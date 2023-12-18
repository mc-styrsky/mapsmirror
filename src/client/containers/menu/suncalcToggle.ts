import { settings } from '../../globals/settings';
import { iconButton } from './iconButton';

export const suncalcToggle = iconButton({
  active: () => settings.show.suncalc,
  icon: 'sunrise',
  onclick: () => settings.show.suncalc = !settings.show.suncalc,
});
