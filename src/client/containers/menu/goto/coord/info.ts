import type { CoordUnit } from '../../../../globals/settings';
import { fromEntriesTyped } from '../../../../../common/fromEntriesTyped';
import { coordUnits } from '../../../../globals/coordUnits';
import { Container } from '../../../../utils/htmlElements/container';

export const coordInfo = fromEntriesTyped(
  coordUnits.map(c => [
    c,
    Container.from('div', {
      classes: ['form-text'],
      style: {
        width: 'max-content',
      },
    }),
  ] as [CoordUnit, Container]),
);
