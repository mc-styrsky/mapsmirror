import type { NavionicsDetail } from '../navionicsDetails';
import { Container } from '../../containers/container';


export function icon (item: NavionicsDetail) {
  return Container.from('div', {
    classes: ['d-flex'],
    style: {
      height: '2em',
      width: '2em',
    },
  })
  .append(
    Container.from('div', {
      style: {
        margin: 'auto',
      },
    })
    .append(
      Container.from('img', {
        src: `/navionics/icon/${encodeURIComponent(item.icon_id)}`,
        style: {
          maxHeight: '1.5em',
          maxWidth: '1.5em',
        },
      }),
    ),
  );
}
