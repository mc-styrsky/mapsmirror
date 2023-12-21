import type { NavionicsDetail } from '../navionicsDetails';
import { Container } from '../../containers/container';

export function label (item: NavionicsDetail) {
  return Container.from('div', {
    classes: ['d-flex'],
  })
  .append(
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
