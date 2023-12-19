import type { Baselayer } from '../../../common/types/layers';
import { baselayers } from '../../globals/baselayers';
import { settings } from '../../globals/settings';
import { redraw } from '../../redraw';
import { createHTMLElement } from '../../utils/createHTMLElement';

export class BaselayerMenu {
  toHtml = () => this.html;

  private baselayerLabel = (source: Baselayer) => `${source || '- none -'} (${baselayers.indexOf(source)})`;

  private baselayerMenuButton = createHTMLElement('a', {
    classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
    dataset: {
      bsToggle: 'dropdown',
    },
    role: 'button',
    zhilds: [this.baselayerLabel(settings.baselayer)],
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
                onclick: () => this.baselayer = source,
                zhilds: [this.baselayerLabel(source)],
              });
            }),
          }),
        ],
      }),
    ],
  });

  set baselayer (baselayer: Baselayer) {
    settings.baselayer = baselayer;
    this.baselayerMenuButton.innerText = this.baselayerLabel(baselayer);
    redraw('changed baselayer');
  }
}

export const baselayerMenu = new BaselayerMenu();
