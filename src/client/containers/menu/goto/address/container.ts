import { Container } from '../../../../utils/htmlElements/container';
import { addressForm } from './form';
import { addressSearchContainer } from './searchContainer';

export const addressContainer = Container.from('div', {
  classes: ['dropdown'],
});

addressContainer.append(
  addressForm,
  addressSearchContainer,
);
