import { Container } from '../../../../utils/htmlElements/container';

export class NavionicsItemSpinner extends Container {
  constructor () {
    super(Container.from('div', {
      classes: ['d-flex'],
    }));
    this.append(
      Container.from('div', {
        classes: [
          'spinner-border',
          'spinner-border-sm',
          'mxA',
          'myA',
        ],
      }),
    );
  }
}
