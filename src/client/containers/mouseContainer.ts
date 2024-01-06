import { mouseInput } from '../events/mouseInput';
import { Container } from '../utils/htmlElements/container';

class MouseContainer extends Container {
  constructor () {
    super('div', {
      classes: ['MapContainerStyle'],
      id: 'mouseContainer',
      onmousedown: mouseInput,
      onmousemove: mouseInput,
      onmouseup: mouseInput,
      onwheel: mouseInput,
    });
  }
}

export const mouseContainer = new MouseContainer;

mouseContainer.html.tagName;
