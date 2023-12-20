import parseDMS from 'parse-dms';
import { position } from '../../../../globals/position';
import { createHTMLElement } from '../../../../utils/createHTMLElement';
import { deg2rad } from '../../../../utils/deg2rad';
import { lat2y } from '../../../../utils/lat2y';
import { lon2x } from '../../../../utils/lon2x';
import { mapContainer } from '../../../mapContainer';
import { coordError } from './error';
import { coordInfo } from './info';
import { coordInput } from './input';
import { coordSubmit } from './submit';

export const coordForm = createHTMLElement('form', {
  action: 'javascript:void(0)',
  classes: ['m-0'],
  onsubmit: () => {
    const { lat: latDeg, lon: lonDeg } = parseDMS(coordInput.value) as { lat: number; lon: number; };
    const { lat, lon } = {
      lat: deg2rad(latDeg),
      lon: deg2rad(lonDeg),
    };

    if (typeof latDeg === 'number' && typeof lonDeg === 'number') {
      position.xyz = {
        x: lon2x(lon),
        y: lat2y(lat),
      };
    }
    mapContainer.redraw('goto');
  },
  style: {
    minWidth: '20em',
  },
  zhilds: [
    createHTMLElement('div', {
      classes: ['input-group'],
      zhilds: [
        coordInput,
        coordSubmit,
      ],
    }),
    coordError,
    coordInfo.d,
    coordInfo.dm,
    coordInfo.dms,
  ],
});
