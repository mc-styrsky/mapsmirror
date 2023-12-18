import type { Baselayer } from '../../../common/types/layers';
import { baselayers } from '../../globals/baselayers';
import { settings } from '../../globals/settings';
import { redraw } from '../../redraw';
import { createHTMLElement } from '../../utils/createHTMLElement';

export class BaselayerMenu {
  toHtml = () => this.html;

  private baselayerLabel = (source: Baselayer) => `${source || '- none -'} (${baselayers.indexOf(source)})`;

  private baselayerMenuButton = createHTMLElement({
    classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
    dataset: {
      bsToggle: 'dropdown',
    },
    role: 'button',
    tag: 'a',
    zhilds: [this.baselayerLabel(settings.baselayer)],
  });
  private html = createHTMLElement({
    classes: ['dropdown'],
    tag: 'div',
    zhilds: [
      this.baselayerMenuButton,
      createHTMLElement({
        classes: ['dropdown-menu'],
        tag: 'ul',
        zhilds: [
          createHTMLElement({
            tag: 'li',
            zhilds: baselayers.map(source => {
              return createHTMLElement({
                classes: ['dropdown-item'],
                onclick: () => this.baselayer = source,
                tag: 'a',
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
