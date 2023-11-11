import { position } from './index';
import { onchange } from './onchange';
import { updateInfoBox } from './updateInfoBox';

export const onmousemove = (event: MouseEvent) => {
  if (event.buttons & 1) onchange(event);
  const { clientX, clientY } = event;
  position.mouse.x = clientX;
  position.mouse.y = clientY;
  updateInfoBox();
};
