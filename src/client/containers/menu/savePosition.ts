import { position } from '../../globals/position';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { editSavedPosition } from './goto/savedPositions/editSavedPosition';

export const savePosition = createHTMLElement({
  classes: ['btn', 'btn-secondary'],
  onclick: () => {
    editSavedPosition({ func: 'add', ...position });
  },
  role: 'button',
  tag: 'a',
  zhilds: ['Save'],
});
