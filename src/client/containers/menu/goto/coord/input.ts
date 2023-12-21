import parseDMS from 'parse-dms';
import { coordUnits } from '../../../../globals/coordUnits';
import { deg2rad } from '../../../../utils/deg2rad';
import { rad2stringFuncs } from '../../../../utils/rad2string';
import { Container } from '../../../container';
import { coordError } from './error';
import { coordInfo } from './info';
import { coordSubmit } from './submit';

export const coordInput = Container.from('input', {
  autocomplete: 'off',
  classes: ['form-control'],
  oninput: () => {
    console.log('oninput');
    coordUnits.forEach(u => {
      coordInfo[u].html.style.display = 'none';
    });

    try {
      if (!coordInput.html.value) coordSubmit.html.classList.add('disabled');
      const { lat: latDeg, lon: lonDeg } = parseDMS(coordInput.html.value) as { lat: number; lon: number; };
      const { lat, lon } = {
        lat: deg2rad(latDeg),
        lon: deg2rad(lonDeg),
      };

      if (typeof latDeg === 'number' && typeof lonDeg === 'number') {
        coordUnits.forEach(u => {
          console.log('update lat/lon');
          const func = rad2stringFuncs[u];
          coordInfo[u].html.innerText = `${func({ axis: 'NS', pad: 2, phi: lat })} ${func({ axis: 'EW', pad: 3, phi: lon })}`;
          coordInfo[u].html.style.display = 'block';
          coordError.html.style.display = 'none';
          coordSubmit.html.classList.remove('disabled');
        });
      }
    }
    catch (e: any) {
      coordError.html.innerText = e.toString();
      coordError.html.style.display = 'block';
      coordSubmit.html.classList.add('disabled');
    }
  },
  placeholder: 'Coordinates',
  type: 'text',
});
