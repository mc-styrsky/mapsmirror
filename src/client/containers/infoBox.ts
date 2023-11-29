import { createHTMLElement } from '../utils/createHTMLElement';


export const infoBox = createHTMLElement({
  classes: ['float-end'],
  style: {
    backgroundColor: '#80808080',
    borderBottomLeftRadius: '1em',
    padding: '0.3em',
  },
  tag: 'div',
  zhilds: [],
});
