import type { Layer } from '../../../common/types/layer';
import { Settings } from '../../globals/settings';
import { IconButton } from '../../utils/htmlElements/iconButton';
import { TilesContainer } from '../tilesContainer';

export class OverlayToggle extends IconButton {
  constructor (source: Layer) {
    super({
      active: () => Boolean(Settings.show[source]),
      onclick: () => {
        Settings.show[source] = !Settings.show[source];
        TilesContainer.rebuild(`overlay ${source} toggle`);
      },
      src: `icons/${source}.svg`,
    });
  }
}
