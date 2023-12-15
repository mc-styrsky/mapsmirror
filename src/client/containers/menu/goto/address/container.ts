import { createHTMLElement } from '../../../../utils/createHTMLElement';
import { addressForm } from './form';
import { addressSearchContainer } from './searchContainer';

export const addressContainer = createHTMLElement({
  classes: ['dropdown'],
  tag: 'div',
  zhilds: [
    addressForm,
    addressSearchContainer,
  ],
});
