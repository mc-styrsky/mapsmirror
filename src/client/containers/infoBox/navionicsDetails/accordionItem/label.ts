import type { INavionicsItemRefresh, NavionicsItemNode } from './navionicsItemNode';
import type { AccordionItem } from '../accordionItem';
import { Container } from '../../../../utils/htmlElements/container';

export class NavionicsItemLabel extends Container implements NavionicsItemNode {
  constructor (item: AccordionItem) {
    super(Container.from('div', {
      classes: ['d-flex'],
    }));
    this.append(
      Container.from('div', {
        style: {
          margin: 'auto',
        },
      })
      .append(item.itemName)
      .append(
        Container.from('div', {
          style: {
            fontSize: '70%',
            marginLeft: '0.5rem',
          },
        })
        .append(this.distance),
      ),
    );
  }
  distance = Container.from('div', {
    style: {
      fontSize: '70%',
      marginLeft: '0.5rem',
    },
  });

  refresh ({ item }: INavionicsItemRefresh) {
    this.distance.clear();
    this.distance.append(item.distance.toFixed(3), 'nm');
  }
}
