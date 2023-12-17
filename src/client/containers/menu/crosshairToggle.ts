import { settings } from '../../globals/settings';
import { iconButton } from './iconButton';

export const crosshairToggle = iconButton({
  active: () => settings.show.crosshair,
  onclick: () => settings.show.crosshair = !settings.show.crosshair,
  src: 'bootstrap-icons-1.11.2/crosshair.svg',
});
