import { Container } from '../../../../utils/htmlElements/container';
import { addressInput } from './input';

export const addressForm = new Container('form', {
  action: 'javascript:void(0)',
  classes: ['GotoForm'],
});

addressForm.append(addressInput);
