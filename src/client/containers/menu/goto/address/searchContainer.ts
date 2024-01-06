import { Container } from '../../../../utils/htmlElements/container';
import { MonoContainer } from '../../../../utils/htmlElements/monoContainer';

export class addressSearchContainer extends MonoContainer {
  static {
    this.copyInstance(new Container('div', {
      classes: ['dropdown-menu'],
    }), this);
  }
}
