import { createHTMLElement } from '../../utils/createHTMLElement';
import { addressContainer } from './goto/address/container';
import { coordForm } from './goto/coord/form';
import { savedPositions } from './goto/savedPositions';


export const gotoMenu = createHTMLElement({
  classes: ['dropdown'],
  tag: 'div',
  zhilds: [
    createHTMLElement({
      classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
      dataset: {
        bsToggle: 'dropdown',
      },
      role: 'button',
      tag: 'a',
      zhilds: ['Goto'],
    }),
    createHTMLElement({
      classes: ['dropdown-menu', 'p-2'],
      tag: 'div',
      zhilds: [
        coordForm,
        addressContainer,
        savedPositions,

      ],
    }),
  ],
});
