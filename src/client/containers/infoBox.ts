import { createHTMLElement } from '../utils/createHTMLElement';


export const infoBox = createHTMLElement({
  classes: ['float-end'],
  dataset: {
    // bsTheme: 'dark',
  },
  style: {
    backgroundColor: '#aaaa',
    borderBottomLeftRadius: '0.5em',
    borderTopLeftRadius: '0.5em',
    padding: '0.3em',
    width: '23em',
  },
  tag: 'div',
  zhilds: [],
});
