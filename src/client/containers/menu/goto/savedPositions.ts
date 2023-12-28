import type { XYZ } from '../../../../common/types/xyz';
import stringify from 'json-stable-stringify';
import { castObject } from '../../../../common/extractProperties';
import { position } from '../../../globals/position';
import { tileSize } from '../../../globals/tileSize';
import { Container } from '../../../utils/htmlElements/container';
import { IconButton } from '../../../utils/htmlElements/iconButton';
import { LocalStorageItem } from '../../../utils/localStorageItem';
import { rad2string } from '../../../utils/rad2string';
import { savedPositionsFromLocalStoreage } from '../../../utils/savedPositionsFromLocalStoreage';
import { x2lon } from '../../../utils/x2lon';
import { y2lat } from '../../../utils/y2lat';
import { mapContainer } from '../../mapContainer';

class SavedPositions extends Container {
  constructor () {
    super();
    this.refresh();
  }
  add ({ x, y, z }: XYZ) {
    this.edit({ func: 'add', x, y, z });
  }
  delete ({ x, y, z }: XYZ) {
    this.edit({ func: 'delete', x, y, z });
  }
  private refresh () {
    this.clear();
    const list: XYZ[] = savedPositionsFromLocalStoreage();
    list.forEach(item => {
      const { x, y, z } = castObject(item, {
        x: val => Number(val) / tileSize,
        y: val => Number(val) / tileSize,
        z: Number,
      });
      console.log({ item, x, y, z });
      this.append(
        Container.from('div', {
          classes: ['btn-group', 'my-2', 'd-flex'],
          role: 'group',
        })
        .append(
          Container.from('a', {
            classes: ['btn', 'btn-secondary'],
            onclick: () => {
              position.xyz = { x, y, z };
              mapContainer.redraw('load position');
            },
            role: 'button',
          })
          .append([
            rad2string({ axis: 'NS', pad: 2, phi: y2lat(y, 1 << z) }),
            rad2string({ axis: 'EW', pad: 3, phi: x2lon(x, 1 << z) }),
            `(${z})`,
          ].join(' ')),
          new IconButton({
            icon: 'x',
            onclick: () => {
              this.delete({ x, y, z });
            },
            style: {
              flexGrow: '0',
            },
          }),
        ),
      );
    });
  }
  private edit ({ func, x, y, z }: XYZ & { func: 'add' | 'delete'; }) {
    const list = new Set(savedPositionsFromLocalStoreage().map(e => stringify(e)));
    list[func](stringify({
      x: Math.round(x * tileSize),
      y: Math.round(y * tileSize),
      z,
    }));
    new LocalStorageItem<XYZ[]>('savedPositions').set([...list].map(e => JSON.parse(e)));
    updateSavedPositionsList();
  }
}

export const savedPositions = new SavedPositions;
function updateSavedPositionsList () {
  throw new Error('Function not implemented.');
}
