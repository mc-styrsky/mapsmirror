import type { NavionicsDetail } from '../navionicsDetails';
import { Container } from '../../../utils/htmlElements/container';


export class NavionicsIcon extends Container {
  constructor (item: NavionicsDetail) {
    super(Container.from('div', {
      classes: ['d-flex'],
      style: {
        height: '2em',
        width: '2em',
      },
    }));

    this.append(
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
}
