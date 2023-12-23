import type { Container } from '../../../../utils/htmlElements/container';
import type { AccordionItem } from '../accordionItem';

export interface INavionicsItemRefresh {
  item: AccordionItem
}

export interface NavionicsItemNode extends Container {
  refresh?: ({ item }: INavionicsItemRefresh) => void;
}
