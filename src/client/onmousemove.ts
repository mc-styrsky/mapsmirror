import { onchange } from './onchange';
import { position } from './position';
import { updateInfoBox } from './updateInfoBox';

export const onmousemove = (event: MouseEvent) => {
  if (event.buttons & 1) onchange(event);
  const { clientX, clientY } = event;
  position.mouse.x = clientX;
  position.mouse.y = clientY;
  updateInfoBox();
};
