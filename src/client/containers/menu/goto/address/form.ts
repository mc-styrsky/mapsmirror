import { Container } from '../../../../utils/htmlElements/container';
import { addressInput } from './input';

export const addressForm = Container.from('form', {
  action: 'javascript:void(0)',
  classes: ['GotoForm'],
});

addressForm.append(addressInput);
