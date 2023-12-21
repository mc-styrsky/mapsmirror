import { StyQueue } from '@mc-styrsky/queue';
import { extractProperties } from '../../../../../common/extractProperties';
import { position } from '../../../../globals/position';
import { deg2rad } from '../../../../utils/deg2rad';
import { lat2y } from '../../../../utils/lat2y';
import { lon2x } from '../../../../utils/lon2x';
import { Container } from '../../../container';
import { mapContainer } from '../../../mapContainer';
import { addressForm } from './form';
import { addressSearchContainer } from './searchContainer';

const addressQueue = new StyQueue(1);

export const addressInput = Container.from('input', {
  autocomplete: 'off',
  classes: ['form-control'],
  oninput: async () => {
    const { value } = addressInput.html;
    while (addressQueue.shift()) void 0;
    const valid = Boolean(value) && await addressQueue.enqueue(() => {
      return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${addressInput.html.value}`)
      .then(async res => {
        if (!res.ok) return false;
        const items = await res.json();
        if (!Array.isArray(items)) return false;
        if (items.length === 0) return false;
        if (value !== addressInput.html.value) return false;

        addressSearchContainer.clear();
        addressSearchContainer.append(
          Container.from('div', {
            classes: ['list-group', 'list-group-flush'],
          })
          .append(
            ...items
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
                addressInput.html.placeholder = value;
                addressInput.html.value = '';
                addressSearchContainer.html.classList.remove('show');
                position.xyz = {
                  x: lon2x(lon, 1 << z),
                  y: lat2y(lat, 1 << z),
                  z,
                };
                mapContainer.redraw('goto address');
              };

              if (idx === 0) addressForm.html.onsubmit = onclick;
              return Container.from('a', {
                classes: ['list-group-item'],
                onclick,
                role: 'button',
              }).append(`${displayName} (${z})`);
            }),
          ),
        );
        return true;
      })
      .catch(() => false);
    });
    if (valid) {
      addressSearchContainer.html.classList.add('show');
    }
    else {
      addressSearchContainer.html.classList.remove('show');
      addressSearchContainer.clear();
    }
  },
  placeholder: 'Address',
  type: 'text',
});
