import type { Layer } from '../../../common/types/layer';
import { settings } from '../../globals/settings';
import { IconButton } from '../../utils/htmlElements/iconButton';
import { mapContainer } from '../tilesContainer';

export class OverlayToggle extends IconButton {
  constructor (source: Layer) {
    super({
      active: () => Boolean(settings.show[source]),
      onclick: () => {
        settings.show[source] = !settings.show[source];
        mapContainer.rebuild(`overlay ${source} toggle`);
      },
      src: `icons/${source}.svg`,
    });
  }
}
