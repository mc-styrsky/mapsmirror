import { NavionicsDetails } from '../containers/infoBox/navionicsDetails';
import { MouseContainer } from '../containers/mouseContainer';
import { Markers } from '../globals/marker';
import { mouse } from '../globals/mouse';
import { position } from '../globals/position';
import { tileSize } from '../globals/tileSize';
import { MainContainer } from '../mainContainer';
import { inputListener } from './inputListener';

export function mouseInput (event: MouseEvent | WheelEvent) {
  const rect = MouseContainer.getBoundingClientRect();
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
      const { height, width } = MainContainer;
      const { x, y, z } = position;
      void NavionicsDetails.fetch({
        x: x + (mouse.x - width / 2) / tileSize,
        y: y + (mouse.y - height / 2) / tileSize,
        z,
      });
    }
    else void NavionicsDetails.fetch(position);
  }

  mouse.down.state = isDown;
  mouse.x = x;
  mouse.y = y;
  Markers.delete('navionics');
}
