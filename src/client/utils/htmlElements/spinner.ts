import { Container } from './container';

export class Spinner extends Container {
  constructor () {
    super(Container.from('div', {
      classes: ['d-flex'],
    }));

    this.append(
      Container.from('div', {
        classes: [
          'spinner-border',
          'spinner-border-sm',
        ],
        style: {
          margin: 'auto',
        },
      }),
    );
  }
}
