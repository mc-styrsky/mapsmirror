import type { Baselayer } from '../../../common/types/layer';
import { layers } from '../../../common/layers';
import { baselayers } from '../../globals/baselayers';
import { settings } from '../../globals/settings';
import { Container } from '../container';
import { mapContainer } from '../mapContainer';

export class BaselayerMenu {
  static baselayerLabel = (source: Baselayer) => `${layers[source].label} (${baselayers.indexOf(source)})`;


  toHtml = () => this.html;

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

  private html = Container.from('div', {
    classes: ['dropdown'],
  })
  .append(
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

export const baselayerMenu = new BaselayerMenu();
