import type { CoordUnits } from '../../globals/settings';
import parseDMS from 'parse-dms';
import { position } from '../../globals/position';
import { redraw } from '../../redraw';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { lat2y } from '../../utils/lat2y';
import { lon2x } from '../../utils/lon2x';
import { rad2degFunctions } from '../../utils/rad2deg';


const coodUnits: CoordUnits[] = ['d', 'dm', 'dms'];
const info = fromEntriesTyped(
  coodUnits.map(c => [
    c,
    createHTMLElement({
      classes: ['form-text'],
      style: {
        width: 'max-content',
      },
      tag: 'div',
    }),
  ] as [CoordUnits, HTMLDivElement]),
);

export const gotoInput = createHTMLElement({
  autocomplete: 'off',
  classes: ['form-control'],
  oninput: () => {
    console.log('oninput');
    coodUnits.forEach(u => {
      info[u].style.display = 'none';
    });

    const { lat: latDeg, lon: lonDeg } = parseDMS(gotoInput.value) as {lat: number, lon: number};
    const { lat, lon } = {
      lat: latDeg * Math.PI / 180,
      lon: lonDeg * Math.PI / 180,
    };

    if (latDeg && lonDeg) coodUnits.forEach(u => {
      console.log('update lat/lon');
      const func = rad2degFunctions[u];
      info[u].innerText = `${func({ axis: 'NS', pad: 2, phi: lat })} ${func({ axis: 'EW', pad: 3, phi: lon })}`;
      info[u].style.display = 'block';
    });
  },
  tag: 'input',
  type: 'text',
});

const submit = createHTMLElement({
  classes: ['btn', 'btn-primary'],
  tag: 'button',
  type: 'submit',
  zhilds: ['Goto'],
});

const form = createHTMLElement({
  action: 'javascript:void(0)',
  classes: ['dropdown-menu', 'p-2'],
  onsubmit: () => {
    const { lat: latDeg, lon: lonDeg } = parseDMS(gotoInput.value) as {lat: number, lon: number};
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
    info.d,
    info.dm,
    info.dms,
  ],
});

export const gotoMenu = createHTMLElement({
  classes: ['dropdown'],
  tag: 'div',
  zhilds: [
    createHTMLElement({
      classes: ['btn', 'btn-secondary', 'dropdown-toggle'],
      dataset: {
        bsToggle: 'dropdown',
      },
      role: 'button',
      tag: 'a',
      zhilds: ['Goto'],
    }),
    form,
  ],
});

function fromEntriesTyped<K extends string, T = any> (entries: Iterable<readonly [K, T]>): Record<K, T> {
  return Object.fromEntries(entries) as any;
}
