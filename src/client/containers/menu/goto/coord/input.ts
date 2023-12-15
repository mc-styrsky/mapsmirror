import parseDMS from 'parse-dms';
import { coordUnits } from '../../../../globals/coordUnits';
import { createHTMLElement } from '../../../../utils/createHTMLElement';
import { deg2rad } from '../../../../utils/deg2rad';
import { rad2degFunctions } from '../../../../utils/rad2deg';
import { coordError } from './error';
import { coordInfo } from './info';
import { coordSubmit } from './submit';

export const coordInput = createHTMLElement({
  autocomplete: 'off',
  classes: ['form-control'],
  oninput: () => {
    console.log('oninput');
    coordUnits.forEach(u => {
      coordInfo[u].style.display = 'none';
    });

    try {
      if (!coordInput.value) coordSubmit.classList.add('disabled');
      const { lat: latDeg, lon: lonDeg } = parseDMS(coordInput.value) as { lat: number; lon: number; };
      const { lat, lon } = {
        lat: deg2rad(latDeg),
        lon: deg2rad(lonDeg),
      };

      if (typeof latDeg === 'number' && typeof lonDeg === 'number') {
        coordUnits.forEach(u => {
          console.log('update lat/lon');
          const func = rad2degFunctions[u];
          coordInfo[u].innerText = `${func({ axis: 'NS', pad: 2, phi: lat })} ${func({ axis: 'EW', pad: 3, phi: lon })}`;
          coordInfo[u].style.display = 'block';
          coordError.style.display = 'none';
          coordSubmit.classList.remove('disabled');
        });
      }
    }
    catch (e: any) {
      coordError.innerText = e.toString();
      coordError.style.display = 'block';
      coordSubmit.classList.add('disabled');
    }
  },
  placeholder: 'Coordinates',
  tag: 'input',
  type: 'text',
});
