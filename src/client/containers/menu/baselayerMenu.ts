import type { Baselayer } from '../../../common/types/layer';
import { layers } from '../../../common/layers';
import { baselayers } from '../../globals/baselayers';
import { settings } from '../../globals/settings';
import { Container } from '../../utils/htmlElements/container';
import { mapContainer } from '../tilesContainer';

export class BaselayerMenu extends Container {
  static baselayerLabel = (source: Baselayer) => `${layers[source].label} (${baselayers.indexOf(source)})`;

  constructor () {
    super(Container.from('div', {
      classes: ['dropdown'],
    }));
    this.append(
      this.baselayerMenuButton,
      Container.from('ul', {
        classes: ['dropdown-menu'],
      })
      . append(
        Container.from('li')
        .append(
          ...baselayers.map(source => {
            return Container.from('a', {
              classes: ['dropdown-item'],
              onclick: () => mapContainer.baselayer = source,
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

  private readonly baselayerMenuButton = Container.from('a', {
    classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
    dataset: {
      bsToggle: 'dropdown',
    },
    role: 'button',
  })
  .append(BaselayerMenu.baselayerLabel(settings.baselayer));
}

export const baselayerMenu = new BaselayerMenu();
