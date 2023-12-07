import { createHTMLElement } from '../utils/createHTMLElement';


export const infoBox = createHTMLElement({
  classes: ['float-end'],
  dataset: {
    bsTheme: 'dark',
  },
  style: {
    backgroundColor: '#80808080',
    borderBottomLeftRadius: '1em',
    borderTopLeftRadius: '1em',
    padding: '0.3em',
    width: '23em',
  },
  tag: 'div',
  zhilds: [],
});
