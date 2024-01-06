import type { Baselayer } from '../../../common/types/layer';
import { LayerSetup } from '../../../common/layers';
import { baselayers } from '../../globals/baselayers';
import { Settings } from '../../globals/settings';
import { Container } from '../../utils/htmlElements/container';
import { MonoContainer } from '../../utils/htmlElements/monoContainer';
import { TilesContainer } from '../tilesContainer';

export class BaselayerMenu extends MonoContainer {
  static labelForSource = (source: Baselayer) => `${LayerSetup.get(source).label} (${baselayers.indexOf(source)})`;

  private static readonly baselayerMenuButton = new Container('a', {
    classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
    dataset: {
      bsToggle: 'dropdown',
    },
    role: 'button',
  })
  .append(BaselayerMenu.labelForSource(Settings.baselayer));

  static {
    this.copyInstance(new Container('div', {
      classes: ['dropdown'],
    }), this);
    this.append(
      this.baselayerMenuButton,
      new Container('ul', {
        classes: ['dropdown-menu'],
      })
      . append(
        new Container('li')
        .append(
          ...baselayers.map(source => {
            return new Container('a', {
              classes: ['dropdown-item'],
              onclick: () => TilesContainer.instance.baselayer = source,
            })
            .append(BaselayerMenu.labelForSource(source));
          }),
        ),
      ),
    );
  }

  static set baselayerLabel (val: Baselayer) {
    this.baselayerMenuButton.html.innerText = BaselayerMenu.labelForSource(val);
  }
}
