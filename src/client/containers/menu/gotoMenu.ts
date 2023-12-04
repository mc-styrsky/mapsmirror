import { createHTMLElement } from '../../utils/createHTMLElement';
import { form } from './goto/form';


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
    form,
  ],
});
