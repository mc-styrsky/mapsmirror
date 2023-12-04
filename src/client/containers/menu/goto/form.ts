import parseDMS from 'parse-dms';
import { position } from '../../../globals/position';
import { redraw } from '../../../redraw';
import { createHTMLElement } from '../../../utils/createHTMLElement';
import { lat2y } from '../../../utils/lat2y';
import { lon2x } from '../../../utils/lon2x';
import { error } from './error';
import { gotoInput } from './gotoInput';
import { info } from './info';
import { savedPositions } from './savedPositions';
import { submit } from './submit';

export const form = createHTMLElement({
  action: 'javascript:void(0)',
  classes: ['dropdown-menu', 'p-2'],
  onsubmit: () => {
    const { lat: latDeg, lon: lonDeg } = parseDMS(gotoInput.value) as { lat: number; lon: number; };
    const { lat, lon } = {
      lat: latDeg * Math.PI / 180,
      lon: lonDeg * Math.PI / 180,
    };

    if (latDeg && lonDeg) {
      position.x = lon2x(lon);
      position.y = lat2y(lat);
    }
    redraw('goto');
  },
  style: {
    minWidth: '20em',
  },
  tag: 'form',
  zhilds: [
    createHTMLElement({
      classes: ['input-group'],
      tag: 'div',
      zhilds: [
        gotoInput,
        submit,
      ],
    }),
    error,
    info.d,
    info.dm,
    info.dms,
    savedPositions,
  ],
});
