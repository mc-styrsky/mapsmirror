import { Container } from '../../utils/htmlElements/container';
import { addressContainer } from './goto/address/container';
import { coordForm } from './goto/coord/form';
import { savedPositions } from './goto/savedPositions';


export const gotoMenu = Container.from('div', {
  classes: ['dropdown'],
});

gotoMenu.append(
  Container.from('a', {
    classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
    dataset: {
      bsToggle: 'dropdown',
    },
    role: 'button',
  })
  .append('Goto'),

  Container.from('div', {
    classes: ['dropdown-menu', 'p-2'],
  })
  .append(
    coordForm,
    addressContainer,
    savedPositions,

  ),
);
