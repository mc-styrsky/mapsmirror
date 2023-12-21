import type { NavionicsDetail } from '../navionicsDetails';
import { Container } from '../../containers/container';

export function spinner (item: NavionicsDetail) {
  if (item.details && !item.properties) return Container.from('div', {
    classes: ['d-flex'],
  })
  .append(
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
  return void 0;
}
