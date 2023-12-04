import parseDMS from 'parse-dms';
import { coordUnits } from '../../../globals/coordUnits';
import { createHTMLElement } from '../../../utils/createHTMLElement';
import { rad2degFunctions } from '../../../utils/rad2deg';
import { error } from './error';
import { info } from './info';

export const gotoInput = createHTMLElement({
  autocomplete: 'off',
  classes: ['form-control'],
  oninput: () => {
    console.log('oninput');
    coordUnits.forEach(u => {
      info[u].style.display = 'none';
    });

    try {
      const { lat: latDeg, lon: lonDeg } = parseDMS(gotoInput.value) as { lat: number; lon: number; };
      const { lat, lon } = {
        lat: latDeg * Math.PI / 180,
        lon: lonDeg * Math.PI / 180,
      };

      if (typeof latDeg === 'number' && typeof lonDeg === 'number') coordUnits.forEach(u => {
        console.log('update lat/lon');
        const func = rad2degFunctions[u];
        info[u].innerText = `${func({ axis: 'NS', pad: 2, phi: lat })} ${func({ axis: 'EW', pad: 3, phi: lon })}`;
        info[u].style.display = 'block';
        error.style.display = 'none';
      });
    }
    catch (e: any) {
      error.innerText = e.toString();
      error.style.display = 'block';
    }
  },
  tag: 'input',
  type: 'text',
});
