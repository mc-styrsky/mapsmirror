import { createHTMLElement } from '../utils/createHTMLElement';

export const overlayContainer = createHTMLElement('div', {
  style: {
    left: '0px',
    position: 'absolute',
    top: '0px',
    zIndex: '-100',
  },
  zhilds: [],
});
