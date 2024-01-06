import { StyQueue } from '@mc-styrsky/queue';
import { castObject } from '../../../../../common/castObject';
import { abs, ceil, log2, max, min } from '../../../../../common/math';
import { position } from '../../../../globals/position';
import { deg2rad } from '../../../../utils/deg2rad';
import { Container } from '../../../../utils/htmlElements/container';
import { lat2y } from '../../../../utils/lat2y';
import { lon2x } from '../../../../utils/lon2x';
import { addressForm } from './form';
import { addressSearchContainer } from './searchContainer';

const addressQueue = new StyQueue(1);

const parseNominatim = (input: any) => {
  if (Array.isArray(input)) {
    return input.map(item =>
      castObject(item, {
        boundingbox: (val) => Array.isArray(val) ? val.map(deg2rad) : [],
        display_name: String,
        importance: Number,
        lat: (val) => deg2rad(Number(val)),
        lon: (val) => deg2rad(Number(val)),
      }),
    );
  }
  return [];
};

export const addressInput = new Container('input', {
  autocomplete: 'off',
  classes: ['form-control'],
  oninput: async () => {
    const { value } = addressInput.html;
    while (addressQueue.shift()) void 0;
    const valid = Boolean(value) && await addressQueue.enqueue(() => {
      return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${addressInput.html.value}`)
      .then(async res => {
        if (!res.ok) return false;
        const items = parseNominatim(await res.json());
        if (items.length === 0) return false;
        if (value !== addressInput.html.value) return false;

        addressSearchContainer.clear();
        addressSearchContainer.append(
          new Container('div', {
            classes: ['list-group', 'list-group-flush'],
          })
          .append(
            ...items
            .sort((a, b) => b.importance - a.importance)
            .map(({ boundingbox, display_name: displayName, lat, lon }, idx) => {
              const [lat1 = lat, lat2 = lat, lon1 = lon, lon2 = lon] = boundingbox;
              const z = (() => {
                if (abs(lat2 - lat1) > 0 && abs(lon2 - lon1) > 0) {
                  const diffX = abs(lon2x(lon2, 1) - lon2x(lon1, 1));
                  const diffY = abs(lat2y(lon2, 1) - lat2y(lon1, 1));
                  const zoom = 1 / max(diffX, diffY);
                  return max(2, min(ceil(log2(zoom)), 17));
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
              };

              if (idx === 0) addressForm.html.onsubmit = onclick;
              return new Container('a', {
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
