import { position } from '../../globals/position';
import { iconButton } from './iconButton';

export const crosshairToggle = iconButton({
  active: () => position.show.crosshair,
  onclick: () => position.show.crosshair = !position.show.crosshair,
  src: 'bootstrap-icons-1.11.2/crosshair.svg',
});
