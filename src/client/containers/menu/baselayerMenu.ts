import type { Baselayer } from '../../../common/types/layers';
import { baselayers } from '../../globals/baselayers';
import { settings } from '../../globals/settings';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { mapContainer } from '../mapContainer';

export class BaselayerMenu {
  static baselayerLabel = (source: Baselayer) => `${source || '- none -'} (${baselayers.indexOf(source)})`;


  toHtml = () => this.html;

  set baselayerLabel (val: string) {
    this.baselayerMenuButton.innerText = val;
  }

  private baselayerMenuButton = createHTMLElement('a', {
    classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
    dataset: {
      bsToggle: 'dropdown',
    },
    role: 'button',
    zhilds: [BaselayerMenu.baselayerLabel(settings.baselayer)],
  });
  private html = createHTMLElement('div', {
    classes: ['dropdown'],
    zhilds: [
      this.baselayerMenuButton,
      createHTMLElement('ul', {
        classes: ['dropdown-menu'],
        zhilds: [
          createHTMLElement('li', {
            zhilds: baselayers.map(source => {
              return createHTMLElement('a', {
                classes: ['dropdown-item'],
                onclick: () => mapContainer.baselayer = source,
                zhilds: [BaselayerMenu.baselayerLabel(source)],
              });
            }),
          }),
        ],
      }),
    ],
  });
}

export const baselayerMenu = new BaselayerMenu();
