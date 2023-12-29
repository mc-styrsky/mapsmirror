import { stylesheet } from '../../globals/stylesheet';
import { Container } from '../../utils/htmlElements/container';
import { addressContainer } from './goto/address/container';
import { coordForm } from './goto/coord/form';
import { savedPositions } from './goto/savedPositions';

stylesheet.addClass({
  GotoForm: {
    margin: '0',
    minWidth: '20em',
  },
});

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
