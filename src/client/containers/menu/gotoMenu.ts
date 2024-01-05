import { position } from '../../globals/position';
import { Stylesheet } from '../../globals/stylesheet';
import { Container } from '../../utils/htmlElements/container';
import { BootstrapIcon } from '../../utils/htmlElements/iconButton';
import { addressContainer } from './goto/address/container';
import { coordForm } from './goto/coord/form';
import { savedPositions } from './goto/savedPositions';

Stylesheet.addClass({
  GotoForm: {
    margin: '0',
    minWidth: '20em',
  },
});

export class GotoMenu extends Container {
  constructor () {
    super(Container.from('div', {
      classes: ['btn-group'],
      role: 'group',
    }));

    this.append(
      Container.from('a', {
        classes: ['btn', 'btn-secondary'],
        onclick: () => {
          savedPositions.add(position.xyz);
        },
        role: 'button',
      }).append('Save'),
    );

    this.append(
      Container.from('div', {
        classes: ['dropdown-menu', 'p-2'],
      })
      .append(
        coordForm,
        addressContainer,
        savedPositions,
      ),
    );

    this.append(
      Container.from('a', {
        classes: ['btn', 'btn-secondary', 'IconButton'],
        dataset: {
          bsToggle: 'dropdown',
        },
        role: 'button',
      }).append(new BootstrapIcon({ icon: 'arrow-right-circle' })),

    );
  }
}
