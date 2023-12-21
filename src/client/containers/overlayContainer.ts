import { containerStyle } from '../globals/containerStyle';
import { position } from '../globals/position';
import { Container } from './container';
import { drawCrosshair } from './overlay/crosshairs';
import { drawNet } from './overlay/net';

class OverlayContainer extends Container<HTMLDivElement> {
  constructor () {
    super(Container.from('div', {
      id: OverlayContainer.name,
      style: containerStyle,
    }));
  }
  redraw () {
    const { height, width } = this.html.getBoundingClientRect();
    const canvas = Container.from('canvas', {
      height,
      style: {
        height: '100%',
        position: 'absolute',
        width: '100%',
      },
      width,
    });
    const context = canvas.html.getContext('2d');

    this.clear();
    if (context) {
      const { x, y } = position;
      context.translate(width / 2, height / 2);
      drawCrosshair({ context, height, width, x, y });
      drawNet({ context, height, width, x, y });
      this.append(canvas);
    }
  }
}

export const overlayContainer = new OverlayContainer();
