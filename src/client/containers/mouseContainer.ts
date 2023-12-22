import { mouseInput } from '../events/mouseInput';
import { containerStyle } from '../globals/containerStyle';
import { Container } from '../utils/htmlElements/container';

class MouseContainer extends Container {
  constructor () {
    super(Container.from('div', {
      id: 'mouseContainer',
      onmousedown: mouseInput,
      onmousemove: mouseInput,
      onmouseup: mouseInput,
      onwheel: mouseInput,
      style: containerStyle,
    }));
  }
}

export const mouseContainer = new MouseContainer;

mouseContainer.html.tagName;
