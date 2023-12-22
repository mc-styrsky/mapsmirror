import type { NavionicsDetail, NavionicsDetails } from '../navionicsDetails';
import { Container } from '../../utils/htmlElements/container';
import { AccordionItem } from './accordionItem';

export class Accordion extends Container {
  constructor ({ items, offset, parent }: {
    items: NavionicsDetail[];
    parent: NavionicsDetails;
    offset?: number;
  }) {
    const accordionId = `navionicsDetailsList${offset ?? ''}`;
    super(Container.from('div', {
      classes: ['accordion'],
      id: accordionId,
    }));

    if (items.length <= 10) items.forEach((item, idx) => {
      this.append(new AccordionItem({
        accordionId,
        idx: idx + (offset ?? 0),
        item,
        parent,
      }));
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
                classes: ['accordion-button',
                  'collapsed',
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
              classes: ['accordion-collapse', 'collapse', 'px-2', i === 0 ? 'show' : null],
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
