import { mouse } from '../globals/mouse';
import { updateInfoBox } from '../updateInfoBox';
import { onchange } from './oninput';

export const onmouse = (event: MouseEvent) => {
  console.log(event.type);
  const { clientX, clientY } = event;
  if (mouse.down) {
    if (mouse.x !== clientX || mouse.y !== clientY) onchange(event);
  }
  mouse.down = Boolean(event.buttons & 1);
  mouse.x = clientX;
  mouse.y = clientY;
  updateInfoBox();
};
