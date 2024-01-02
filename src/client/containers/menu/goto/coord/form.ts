import parseDMS from 'parse-dms';
import { position } from '../../../../globals/position';
import { deg2rad } from '../../../../utils/deg2rad';
import { Container } from '../../../../utils/htmlElements/container';
import { lat2y } from '../../../../utils/lat2y';
import { lon2x } from '../../../../utils/lon2x';
import { coordError } from './error';
import { coordInfo } from './info';
import { coordInput } from './input';
import { coordSubmit } from './submit';

export const coordForm = Container.from('form', {
  action: 'javascript:void(0)',
  classes: ['GotoForm'],
  onsubmit: () => {
    const { lat: latDeg, lon: lonDeg } = parseDMS(coordInput.html.value) as { lat: number; lon: number; };
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
  },
});

coordForm.append(
  Container.from('div', {
    classes: ['input-group'],
  })
  .append(
    coordInput,
    coordSubmit,
  ),
  coordError,
  coordInfo.d,
  coordInfo.dm,
  coordInfo.dms,
);
