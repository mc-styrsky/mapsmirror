import { infoBox } from '../containers/infoBox';
import { mapContainer } from '../containers/mapContainer';
import { mouseContainer } from '../containers/mouseContainer';
import { mouse } from '../globals/mouse';
import { navionicsDetails } from '../globals/navionicsDetails';
import { position } from '../globals/position';
import { tileSize } from '../globals/tileSize';
import { boundingRect } from '../index';
import { inputListener } from './inputListener';

export function mouseInput (event: MouseEvent | WheelEvent) {
  const rect = mouseContainer.getBoundingClientRect();
  const { x, y } = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
  if (mouse.down.state) {
    if (mouse.x !== x || mouse.y !== y) inputListener(event, { x, y });
  }
  if (event instanceof WheelEvent) inputListener(event, { x, y });

  const isDown = Boolean(event.buttons & 1);
  // mousedown
  if (isDown && !mouse.down.state) {
    mouse.down.x = x;
    mouse.down.y = y;
  }
  // mouseup
  if (!isDown && mouse.down.state) {
    // onclick
    if (mouse.down.x === x && mouse.down.y === y) {
      const { height, width } = boundingRect;
      const { x, y, z } = position;
      navionicsDetails.fetch({
        x: x + (mouse.x - width / 2) / tileSize,
        y: y + (mouse.y - height / 2) / tileSize,
        z,
      });
    }
    else navionicsDetails.fetch(position);
  }

  mouse.down.state = isDown;
  mouse.x = x;
  mouse.y = y;
  if (position.markers.delete('navionics')) mapContainer.redraw('delete navionics marker');
  infoBox.update();
}