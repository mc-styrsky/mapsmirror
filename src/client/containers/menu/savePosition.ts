import { position } from '../../globals/position';
import { Container } from '../container';
import { editSavedPosition } from './goto/savedPositions/editSavedPosition';

export const savePosition = Container.from('a', {
  classes: ['btn', 'btn-secondary'],
  onclick: () => {
    editSavedPosition({ func: 'add', ...position.xyz });
  },
  role: 'button',
})
.append('Save');
