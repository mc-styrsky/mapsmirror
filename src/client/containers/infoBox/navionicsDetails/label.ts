import type { NavionicsDetail } from '../navionicsDetails';
import { Container } from '../../../utils/htmlElements/container';

export class NavionicsItemLabel extends Container {
  constructor (item: NavionicsDetail) {
    super(Container.from('div', {
      classes: ['d-flex'],
    }));
    this.append(
      Container.from('div', {
        style: {
          margin: 'auto',
        },
      })
      .append(item.name)
      .append(
        Container.from('div', {
          style: {
            fontSize: '70%',
            marginLeft: '0.5rem',
          },
        })
        .append(item.distance.toFixed(3), 'nm'),
      ),
    );
  }
}
