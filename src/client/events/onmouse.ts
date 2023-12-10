import { mouse } from '../globals/mouse';
import { navionicsDetails } from '../globals/navionicsDetails';
import { position } from '../globals/position';
import { tileSize } from '../globals/tileSize';
import { boundingRect } from '../index';
import { redraw } from '../redraw';
import { updateInfoBox } from '../updateInfoBox';
import { onchange } from './oninput';

export const onmouse = (event: MouseEvent) => {
  if (!(event.target instanceof HTMLBodyElement)) return;
  const { clientX, clientY } = event;
  if (mouse.down.state) {
    if (mouse.x !== clientX || mouse.y !== clientY) onchange(event);
  }
  const isDown = Boolean(event.buttons & 1);
  // mousedown
  if (isDown && !mouse.down.state) {
    mouse.down.x = clientX;
    mouse.down.y = clientY;
  }
  // mouseup
  if (!isDown && mouse.down.state) {
    // onclick
    if (mouse.down.x === clientX && mouse.down.y === clientY) {
      const { height, width } = boundingRect;
      const { x, y, z } = position;
      navionicsDetails.fetch({
        x: x + (mouse.x - width / 2) / tileSize,
        y: y + (mouse.y - height / 2) / tileSize,
        z,
      });
    }
  }

  mouse.down.state = isDown;
  mouse.x = clientX;
  mouse.y = clientY;
  if (position.markers.delete('navionics')) redraw('delete navionics marker');
  updateInfoBox();
};
