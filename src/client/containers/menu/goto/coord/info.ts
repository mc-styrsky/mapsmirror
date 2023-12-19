import type { CoordUnit } from '../../../../globals/settings';
import { fromEntriesTyped } from '../../../../../common/fromEntriesTyped';
import { coordUnits } from '../../../../globals/coordUnits';
import { createHTMLElement } from '../../../../utils/createHTMLElement';

export const coordInfo = fromEntriesTyped(
  coordUnits.map(c => [
    c,
    createHTMLElement('div', {
      classes: ['form-text'],
      style: {
        width: 'max-content',
      },
    }),
  ] as [CoordUnit, HTMLDivElement]),
);
