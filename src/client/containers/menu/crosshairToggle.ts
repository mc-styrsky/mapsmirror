import { Settings } from '../../globals/settings';
import { IconButton } from '../../utils/htmlElements/iconButton';
import { MonoContainer } from '../../utils/htmlElements/monoContainer';
import { OverlayContainer } from '../overlayContainer';

export class CrosshairToggle extends MonoContainer<'a'> {
  static {
    this.copyInstance<'a'>(new IconButton({
      active: () => Settings.show.crosshair,
      icon: 'crosshair',
      onclick: () => {
        Settings.show.crosshair = !Settings.show.crosshair;
        OverlayContainer.refresh();
      },
    }), this);
  }
}
