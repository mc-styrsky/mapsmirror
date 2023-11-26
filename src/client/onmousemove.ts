import { mouse } from './globals/mouse';
import { onchange } from './onchange';
import { updateInfoBox } from './updateInfoBox';

export const onmousemove = (event: MouseEvent) => {
  if (event.buttons & 1) onchange(event);
  const { clientX, clientY } = event;
  mouse.x = clientX;
  mouse.y = clientY;
  updateInfoBox();
};
