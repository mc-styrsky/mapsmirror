import { Container } from '../../../../utils/htmlElements/container';

export class NavionicsItemDetails extends Container {
  constructor () {
    super(Container.from('div', {
    }));

    this.append('fetching...');
  }
}
