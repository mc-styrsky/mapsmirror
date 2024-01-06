import { Container } from '../../../../utils/htmlElements/container';
import { MonoContainer } from '../../../../utils/htmlElements/monoContainer';
import { addressInput } from './input';

export class AddressForm extends MonoContainer {
  static {
    this.copyInstance(new Container('form', {
      action: 'javascript:void(0)',
      classes: ['GotoForm'],
    }), this);
    this.append(addressInput);
  }
}
