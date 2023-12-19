import { createHTMLElement } from '../../utils/createHTMLElement';
import { addressContainer } from './goto/address/container';
import { coordForm } from './goto/coord/form';
import { savedPositions } from './goto/savedPositions';


export const gotoMenu = createHTMLElement('div', {
  classes: ['dropdown'],
  zhilds: [
    createHTMLElement('a', {
      classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
      dataset: {
        bsToggle: 'dropdown',
      },
      role: 'button',
      zhilds: ['Goto'],
    }),
    createHTMLElement('div', {
      classes: ['dropdown-menu', 'p-2'],
      zhilds: [
        coordForm,
        addressContainer,
        savedPositions,

      ],
    }),
  ],
});
