import { position } from '../../globals/position';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { editSavedPosition } from './goto/savedPositions/editSavedPosition';

export const savePosition = createHTMLElement('a', {
  classes: ['btn', 'btn-secondary'],
  onclick: () => {
    editSavedPosition({ func: 'add', ...position.xyz });
  },
  role: 'button',
  zhilds: ['Save'],
});
