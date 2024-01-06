import type { Baselayer } from '../../../common/types/layer';
import { LayerSetup } from '../../../common/layers';
import { baselayers } from '../../globals/baselayers';
import { settings } from '../../globals/settings';
import { Container } from '../../utils/htmlElements/container';
import { TilesContainer } from '../tilesContainer';

export class BaselayerMenu extends Container {
  static baselayerLabel = (source: Baselayer) => `${LayerSetup.get(source).label} (${baselayers.indexOf(source)})`;

  constructor () {
    super('div', {
      classes: ['dropdown'],
    });
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
            .append(BaselayerMenu.baselayerLabel(source));
          }),
        ),
      ),
    );
  }

  set baselayerLabel (val: string) {
    this.baselayerMenuButton.html.innerText = val;
  }

  private readonly baselayerMenuButton = new Container('a', {
    classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
    dataset: {
      bsToggle: 'dropdown',
    },
    role: 'button',
  })
  .append(BaselayerMenu.baselayerLabel(settings.baselayer));
}

export const baselayerMenu = new BaselayerMenu();
