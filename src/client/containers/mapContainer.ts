import { createHTMLElement } from '../utils/createHTMLElement';

export const mapContainer = createHTMLElement('div', {
  style: {
    left: '0px',
    position: 'absolute',
    top: '0px',
    zIndex: '-200',
  },
  zhilds: [],
});
