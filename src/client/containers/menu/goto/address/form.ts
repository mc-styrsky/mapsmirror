import { Container } from '../../../../utils/htmlElements/container';
import { addressInput } from './input';

export const addressForm = Container.from('form', {
  action: 'javascript:void(0)',
  classes: ['m-0'],
  style: {
    minWidth: '20em',
  },
});

addressForm.append(addressInput);
