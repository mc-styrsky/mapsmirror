import { position } from '../../globals/position';
import { Stylesheet } from '../../globals/stylesheet';
import { Container } from '../../utils/htmlElements/container';
import { BootstrapIcon } from '../../utils/htmlElements/iconButton';
import { AddressContainer } from './goto/address/container';
import { CoordForm } from './goto/coord/form';
import { SavedPositions } from './goto/savedPositions';

Stylesheet.addClass({
  GotoForm: {
    margin: '0',
    minWidth: '20em',
  },
});

export class GotoMenu extends Container {
  constructor () {
    super('div', {
      classes: ['btn-group'],
      role: 'group',
    });

    this.append(
      new Container('a', {
        classes: ['btn', 'btn-secondary'],
        onclick: () => {
          SavedPositions.add(position.xyz);
        },
        role: 'button',
      }).append('Save'),
    );

    this.append(
      new Container('div', {
        classes: ['dropdown-menu', 'p-2'],
      })
      .append(
        CoordForm,
        AddressContainer,
        SavedPositions,
      ),
    );

    this.append(
      new Container('a', {
        classes: ['btn', 'btn-secondary', 'IconButton'],
        dataset: {
          bsToggle: 'dropdown',
        },
        role: 'button',
      }).append(new BootstrapIcon({ icon: 'arrow-right-circle' })),

    );
  }
}
