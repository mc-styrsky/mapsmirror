import { settings } from '../../globals/settings';
import { iconButton } from './iconButton';

export const suncalcToggle = iconButton({
  active: () => settings.show.suncalc,
  onclick: () => settings.show.suncalc = !settings.show.suncalc,
  src: 'bootstrap-icons-1.11.2/sunrise.svg',
});
