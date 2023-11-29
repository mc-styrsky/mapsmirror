import type { Layers } from '../../../common/types/layers';
import { settings } from '../../globals/settings';
import { iconButton } from './iconButton';

export const overlayToggle = (source: Layers) => iconButton({
  active: () => Boolean(settings.tiles.enabled[source]),
  onclick: () => settings.tiles.enabled[source] = !settings.tiles.enabled[source],
  src: `icons/${source}.svg`,
});
