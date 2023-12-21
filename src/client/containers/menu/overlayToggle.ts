import type { Layer } from '../../../common/types/layer';
import { settings } from '../../globals/settings';
import { iconButton } from './iconButton';

export const overlayToggle = (source: Layer) => iconButton({
  active: () => Boolean(settings.show[source]),
  onclick: () => settings.show[source] = !settings.show[source],
  src: `icons/${source}.svg`,
});
