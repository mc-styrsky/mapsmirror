import { Container } from '../../../../utils/htmlElements/container';

export class NavionicsItemSpinner extends Container {
  constructor () {
    super('div', {
      classes: ['d-flex'],
    });
    this.append(
      new Container('div', {
        classes: [
          'spinner-border',
          'spinner-border-sm',
          'mx-auto',
          'my-auto',
        ],
      }),
    );
  }
}
