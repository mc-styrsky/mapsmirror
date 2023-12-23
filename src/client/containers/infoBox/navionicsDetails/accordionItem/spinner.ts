import type { INavionicsItemRefresh, NavionicsItemNode } from './navionicsItemNode';
import { Container } from '../../../../utils/htmlElements/container';

export class NavionicsItemSpinner extends Container implements NavionicsItemNode {
  constructor () {
    super(Container.from('div', {
      classes: ['d-flex'],
    }));
  }
  visible?: boolean;
  refresh ({ item }: INavionicsItemRefresh) {
    if (this.visible !== Boolean(item.properties)) {
      const visible = Boolean(item.properties);
      if (visible) this.clear();
      else this.append(
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

      this.visible = visible;
    }
  }
}
