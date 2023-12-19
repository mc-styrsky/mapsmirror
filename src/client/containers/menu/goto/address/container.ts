import { createHTMLElement } from '../../../../utils/createHTMLElement';
import { addressForm } from './form';
import { addressSearchContainer } from './searchContainer';

export const addressContainer = createHTMLElement('div', {
  classes: ['dropdown'],
  zhilds: [
    addressForm,
    addressSearchContainer,
  ],
});
