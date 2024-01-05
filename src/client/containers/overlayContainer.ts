import { markers } from '../globals/marker';
import { position } from '../globals/position';
import { Stylesheet } from '../globals/stylesheet';
import { Container } from '../utils/htmlElements/container';
import { drawCrosshair } from './overlay/crosshairs';
import { drawMarkers } from './overlay/markers';
import { drawNet } from './overlay/net';

Stylesheet.addClass({
  OverlayContainerCanvas: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
});

class OverlayContainer extends Container {
  constructor () {
    super(Container.from('div', {
      classes: ['MapContainerStyle'],
      id: OverlayContainer.name,
    }));
    position.listeners.add(() => this.refresh());
    markers.listeners.add(() => this.refresh());
    this.refresh();
  }

  refresh () {
    const { height, width } = this.html.getBoundingClientRect();
    const canvas = Container.from('canvas', {
      classes: ['OverlayContainerCanvas'],
      height,
      width,
    });
    const context = canvas.html.getContext('2d');

    this.clear();
    if (context) {
      const { x, y } = position;
      context.translate(width / 2, height / 2);
      const props = { context, height, width, x, y };
      drawCrosshair(props);
      drawNet(props);
      drawMarkers(props);
      this.append(canvas);
    }
  }
}

export const overlayContainer = new OverlayContainer();
