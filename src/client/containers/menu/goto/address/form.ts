import { createHTMLElement } from '../../../../utils/createHTMLElement';
import { addressInput } from './input';

export const addressForm: HTMLFormElement = createHTMLElement('form', {
  action: 'javascript:void(0)',
  classes: ['m-0'],
  style: {
    minWidth: '20em',
  },
  zhilds: [addressInput],
});
