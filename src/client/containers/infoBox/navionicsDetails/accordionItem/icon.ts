import type { NavionicsItemNode } from './navionicsItemNode';
import type { AccordionItem } from '../accordionItem';
import { Container } from '../../../../utils/htmlElements/container';


export class NavionicsIcon extends Container implements NavionicsItemNode {
  constructor (item: AccordionItem) {
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
          src: `/navionics/icon/${encodeURIComponent(item.iconId)}`,
          style: {
            maxHeight: '1.5em',
            maxWidth: '1.5em',
          },
        }),
      ),
    );
  }
}
