import { position } from '../../globals/position';
import { Container } from '../../utils/htmlElements/container';
import { savedPositions } from './goto/savedPositions';

export const savePosition = Container.from('a', {
  classes: ['btn', 'btn-secondary'],
  onclick: () => {
    savedPositions.add(position.xyz);
  },
  role: 'button',
});

savePosition.append('Save');
