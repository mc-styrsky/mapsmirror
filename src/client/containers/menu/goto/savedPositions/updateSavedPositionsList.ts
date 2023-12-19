import type { XYZ } from '../../../../../common/types/xyz';
import { extractProperties } from '../../../../../common/extractProperties';
import { position } from '../../../../globals/position';
import { tileSize } from '../../../../globals/tileSize';
import { redraw } from '../../../../redraw';
import { createHTMLElement } from '../../../../utils/createHTMLElement';
import { rad2string } from '../../../../utils/rad2string';
import { savedPositionsFromLocalStoreage } from '../../../../utils/savedPositionsFromLocalStoreage';
import { x2lon } from '../../../../utils/x2lon';
import { y2lat } from '../../../../utils/y2lat';
import { iconButton } from '../../iconButton';
import { savedPositions } from '../savedPositions';
import { editSavedPosition } from './editSavedPosition';


export function updateSavedPositionsList () {
  savedPositions.innerHTML = '';
  const list: XYZ[] = savedPositionsFromLocalStoreage();
  list.forEach(item => {
    const { x, y, z } = extractProperties(item, {
      x: val => Number(val) / tileSize,
      y: val => Number(val) / tileSize,
      z: Number,
    });
    console.log({ item, x, y, z });
    savedPositions.append(createHTMLElement('div', {
      classes: ['btn-group', 'my-2', 'd-flex'],
      role: 'group',
      zhilds: [
        createHTMLElement('a', {
          classes: ['btn', 'btn-secondary'],
          onclick: () => {
            position.xyz = { x, y, z };
            redraw('load position');
          },
          role: 'button',
          zhilds: [[
            rad2string({ axis: 'NS', pad: 2, phi: y2lat(y, 1 << z) }),
            rad2string({ axis: 'EW', pad: 3, phi: x2lon(x, 1 << z) }),
            `(${z})`,
          ].join(' ')],
        }),
        iconButton({
          icon: 'x',
          onclick: () => {
            editSavedPosition({ func: 'delete', x, y, z });
          },
          style: {
            flexGrow: '0',
          },
        }),
      ],
    }));
  });
}
