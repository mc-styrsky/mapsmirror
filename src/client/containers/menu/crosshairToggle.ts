import { settings } from '../../globals/settings';
import { IconButton } from '../../utils/htmlElements/iconButton';
import { overlayContainer } from '../overlayContainer';

export const crosshairToggle = new IconButton({
  active: () => settings.show.crosshair,
  icon: 'crosshair',
  onclick: () => {
    settings.show.crosshair = !settings.show.crosshair;
    overlayContainer.redraw();
  },
});
