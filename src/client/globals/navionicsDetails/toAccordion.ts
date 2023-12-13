import type { NavionicsDetail, NavionicsDetails } from '../navionicsDetails';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { accordionItem } from './accordionItem';

export const toAccordion = ({ items, offset, parent }: {
  items: NavionicsDetail[];
  parent: NavionicsDetails;
  offset?: number;
}) => {
  const accordionId = `navionicsDetailsList${offset ?? ''}`;
  const ret = createHTMLElement({
    classes: ['accordion'],
    id: accordionId,
    tag: 'div',
  });
  if (items.length <= 10) ret.append(...items.map((item, idx) => accordionItem({
    accordionId,
    idx: idx + (offset ?? 0),
    item,
    parent,
  })),
  );
  else for (let i = 0; i < items.length; i += 10) {
    const itemId = `navionicsDetailsItemList${i}`;
    const itemsSlice = items.slice(i, i + 10);
    ret.append(createHTMLElement({
      classes: [
        'accordion-item',
        'mm-menu-text',
      ],
      tag: 'div',
      zhilds: [
        createHTMLElement({
          classes: [
            'accordion-header',
            'mm-menu-text',
          ],
          tag: 'div',
          zhilds: [
            createHTMLElement({
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
              tag: 'div',
              zhilds: [createHTMLElement({
                classes: ['d-flex'],
                style: {
                  width: '100%',
                },
                tag: 'div',
                zhilds: [
                  itemsSlice.length === 1 ?
                    `${i + 1}` :
                    `${i + 1}-${i + itemsSlice.length}`,
                ],
              })],
            }),
          ],
        }),
        createHTMLElement({
          classes: ['accordion-collapse', 'collapse', 'px-2', i === 0 ? 'show' : null],
          dataset: {
            bsParent: `#${accordionId}`,
          },
          id: itemId,
          tag: 'div',
          zhilds: [
            toAccordion({ items: itemsSlice, offset: i, parent }),
          ],
        }),
      ],
    }));
  }
  return ret;
};
