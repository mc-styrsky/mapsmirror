import type { Baselayers } from '../../../common/types/layers';
import { settings } from '../../globals/settings';
import { redraw } from '../../redraw';
import { createHTMLElement } from '../../utils/createHTMLElement';

const baselayerMenuButton = createHTMLElement({
  classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
  dataset: {
    bsToggle: 'dropdown',
  },
  role: 'button',
  tag: 'a',
  zhilds: ['Baselayer'],
});

export const setBaseLayer = (source: Baselayers) => {
  settings.tiles.baselayers.forEach(key => settings.tiles.enabled[key] = key === source);
  settings.tiles.order[0] = source;
  baselayerMenuButton.innerText = source;
  redraw('changed baselayer');
};

export const baselayerMenu = createHTMLElement({
  classes: ['dropdown'],
  tag: 'div',
  zhilds: [
    baselayerMenuButton,
    createHTMLElement({
      classes: ['dropdown-menu'],
      tag: 'ul',
      zhilds: [
        createHTMLElement({
          tag: 'li',
          zhilds: settings.tiles.baselayers.map(source => {
            return createHTMLElement({
              classes: ['dropdown-item'],
              onclick: () => setBaseLayer(source),
              tag: 'a',
              zhilds: [source || '- none -'],
            });
          }),
        }),
      ],
    }),
  ],
});
