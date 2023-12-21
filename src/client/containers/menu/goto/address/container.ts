import { Container } from '../../../container';
import { addressForm } from './form';
import { addressSearchContainer } from './searchContainer';

export const addressContainer = Container.from('div', {
  classes: ['dropdown'],
})
.append(
  addressForm,
  addressSearchContainer,
);
