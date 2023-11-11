import { createCanvas } from './createCanvas';
import { createHTMLElement } from './createHTMLElement';
import { container, position } from './index';
import { updateInfoBox } from './updateInfoBox';

let working = false;
let newWorker: boolean = false;
export const infoBox = createHTMLElement({
  style: {
    backgroundColor: '#ffffff40',
    left: '0px',
    position: 'absolute',
    top: '0px',
  },
  tag: 'div',
  zhilds: [
  ],
});

export const redraw = async () => {
  if (!container) return;
  if (working) {
    if (newWorker) return;
    newWorker = true;
    setTimeout(() => {
      newWorker = false;
      redraw();
    }, 10);
    return;
  }
  working = true;
  newWorker = false;
  console.log('redraw');
  const { height, width } = container.getBoundingClientRect();

  await createCanvas({
    height,
    width,
    ...position,
  })
  .then(newCanvas => {
    if (!container) return;
    container.innerHTML = '';
    container.append(newCanvas);
    updateInfoBox();
    container.append(infoBox);
  });

  const newlocation = `${window.location.origin}${window.location.pathname}?${Object.entries({
    source: position.source,
    ttl: position.ttl,
    x: position.x,
    y: position.y,
    z: position.z,
  })
  .map(([k, v]) => `${k}=${v}`)
  .join('&')}`;
  window.history.pushState({ path: newlocation }, '', newlocation);

  setTimeout(() => working = false, 100);
};
