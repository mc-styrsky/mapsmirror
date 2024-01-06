import { mouseInput } from '../events/mouseInput';
import { Container } from '../utils/htmlElements/container';
import { MonoContainer } from '../utils/htmlElements/monoContainer';

export class MouseContainer extends MonoContainer {
  static {
    this.copyInstance(new Container('div', {
      classes: ['MapContainerStyle'],
      id: 'mouseContainer',
      onmousedown: mouseInput,
      onmousemove: mouseInput,
      onmouseup: mouseInput,
      onwheel: mouseInput,
    }), this);
  }
}
