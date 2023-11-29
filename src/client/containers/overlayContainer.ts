import { createHTMLElement } from '../utils/createHTMLElement';

export const overlayContainer = createHTMLElement({
  style: {
    left: '0px',
    position: 'absolute',
    top: '0px',
    zIndex: '-100',
  },
  tag: 'div',
  zhilds: [],
});
