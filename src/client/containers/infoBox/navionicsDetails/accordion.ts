import type { AccordionItem } from './accordionItem';
import type { NavionicsDetails } from '../navionicsDetails';
import { Container } from '../../../utils/htmlElements/container';

export class Accordion extends Container {
  constructor ({ items, offset, parent }: {
    items: AccordionItem[];
    parent: NavionicsDetails;
    offset?: number;
  }) {
    const accordionId = `navionicsDetailsList${offset ?? ''}`;
    super(Container.from('div', {
      classes: ['accordion'],
      id: accordionId,
    }));

    if (items.length <= 10) items.forEach(item => {
      this.append(item);
      item.refresh();
    });
    else {
      for (let i = 0; i < items.length; i += 10) {
        const itemId = `navionicsDetailsItemList${i}`;
        const itemsSlice = items.slice(i, i + 10);
        this.append(
          Container.from('div', {
            classes: [
              'accordion-item',
              'mm-menu-text',
            ],
          })
          .append(
            Container.from('div', {
              classes: [
                'accordion-header',
                'mm-menu-text',
              ],
            })
            .append(
              Container.from('div', {
                classes: [
                  'accordion-button',
                  i === 0 ? null : 'collapsed',
                  'px-2',
                  'py-0',
                  'mm-menu-text',
                ],
                dataset: {
                  bsTarget: `#${itemId}`,
                  bsToggle: 'collapse',
                },
              })
              .append(
                Container.from('div', {
                  classes: ['d-flex'],
                  style: {
                    width: '100%',
                  },
                })
                .append(
                  itemsSlice.length === 1 ?
                    `${i + 1}` :
                    `${i + 1}-${i + itemsSlice.length}`,
                ),
              ),
            ),
          )
          .append(
            Container.from('div', {
              classes: [
                'accordion-collapse',
                'collapse',
                'ps-2',
                'pe-0',
                i === 0 ? 'show' : null,
              ],
              dataset: {
                bsParent: `#${accordionId}`,
              },
              id: itemId,
            })
            .append(new Accordion({ items: itemsSlice, offset: i, parent })),
          ),
        );
      }
    }
  }
}
