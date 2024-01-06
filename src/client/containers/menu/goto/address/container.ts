import { Container } from '../../../../utils/htmlElements/container';
import { addressForm } from './form';
import { addressSearchContainer } from './searchContainer';

export const addressContainer = new Container('div', {
  classes: ['dropdown'],
});

addressContainer.append(
  addressForm,
  addressSearchContainer,
);
