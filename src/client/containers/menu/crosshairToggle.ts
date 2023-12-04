import { settings } from '../../globals/settings';
import { iconButton } from './iconButton';

export const crosshairToggle = iconButton({
  active: () => settings.crosshair.show,
  onclick: () => settings.crosshair.show = !settings.crosshair.show,
  src: 'bootstrap-icons-1.11.2/crosshair.svg',
});
