import { Container } from '../../../../utils/htmlElements/container';
import { MonoContainer } from '../../../../utils/htmlElements/monoContainer';
import { AddressForm } from './form';
import { addressSearchContainer } from './searchContainer';

export class AddressContainer extends MonoContainer {
  static {
    this.copyInstance(new Container('div', {
      classes: ['dropdown'],
    }), this);
    this.append(
      AddressForm,
      addressSearchContainer,
    );
  }
}
