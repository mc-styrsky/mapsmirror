import { StyQueue } from '@mc-styrsky/queue';
import { extractProperties } from '../../../../../common/extractProperties';
import { position } from '../../../../globals/position';
import { createHTMLElement } from '../../../../utils/createHTMLElement';
import { deg2rad } from '../../../../utils/deg2rad';
import { lat2y } from '../../../../utils/lat2y';
import { lon2x } from '../../../../utils/lon2x';
import { mapContainer } from '../../../mapContainer';
import { addressForm } from './form';
import { addressSearchContainer } from './searchContainer';

const addressQueue = new StyQueue(1);

export const addressInput = createHTMLElement('input', {
  autocomplete: 'off',
  classes: ['form-control'],
  oninput: async () => {
    const { value } = addressInput;
    while (addressQueue.shift()) void 0;
    const valid = Boolean(value) && await addressQueue.enqueue(() => {
      return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${addressInput.value}`)
      .then(async res => {
        if (!res.ok) return false;
        const items = await res.json();
        if (!Array.isArray(items)) return false;
        if (items.length === 0) return false;
        if (value !== addressInput.value) return false;

        const zhilds = items
        .sort((a, b) => b.importance - a.importance)
        .map((item, idx) => {
          const { boundingbox, display_name: displayName, lat, lon } = extractProperties(item, {
            boundingbox: (val) => Array.isArray(val) ? val.map(deg2rad) : [],
            display_name: String,
            lat: deg2rad,
            lon: deg2rad,
          });
          const [lat1 = lat, lat2 = lat, lon1 = lon, lon2 = lon] = boundingbox;
          const z = (() => {
            if (Math.abs(lat2 - lat1) > 0 && Math.abs(lon2 - lon1) > 0) {
              const diffX = Math.abs(lon2x(lon2, 1) - lon2x(lon1, 1));
              const diffY = Math.abs(lat2y(lon2, 1) - lat2y(lon1, 1));
              const zoom = 1 / Math.max(diffX, diffY);
              return Math.max(2, Math.min(Math.ceil(Math.log2(zoom)), 17));
            }
            return position.z;
          })();
          const onclick = () => {
            addressInput.placeholder = value;
            addressInput.value = '';
            addressSearchContainer.classList.remove('show');
            position.xyz = {
              x: lon2x(lon, 1 << z),
              y: lat2y(lat, 1 << z),
              z,
            };
            mapContainer.redraw('goto address');
          };

          if (idx === 0) addressForm.onsubmit = onclick;
          return createHTMLElement('a', {
            classes: ['list-group-item'],
            onclick,
            role: 'button',
            zhilds: [displayName, ` (${z})`],
          });
        });
        addressSearchContainer.innerHTML = '';
        addressSearchContainer.append(createHTMLElement('div', {
          classes: ['list-group', 'list-group-flush'],
          zhilds,
        }));
        return true;
      })
      .catch(() => false);
    });
    if (valid) {
      addressSearchContainer.classList.add('show');
    }
    else {
      addressSearchContainer.classList.remove('show');
      addressSearchContainer.innerHTML = '';
    }
  },
  placeholder: 'Address',
  type: 'text',
});
