import { settings } from '../../globals/settings';
import { iconButton } from './iconButton';

export const crosshairToggle = iconButton({
  active: () => settings.show.crosshair,
  icon: 'crosshair',
  onclick: () => settings.show.crosshair = !settings.show.crosshair,
});
