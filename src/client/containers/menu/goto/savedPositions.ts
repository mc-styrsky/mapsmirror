import type { XYZ } from '../../../../common/types/xyz';
import stringify from 'json-stable-stringify';
import { castObject } from '../../../../common/extractProperties';
import { round } from '../../../../common/math';
import { position } from '../../../globals/position';
import { tileSize } from '../../../globals/tileSize';
import { Container } from '../../../utils/htmlElements/container';
import { Distance } from '../../../utils/htmlElements/distance';
import { IconButton } from '../../../utils/htmlElements/iconButton';
import { LocalStorageItem } from '../../../utils/localStorageItem';
import { rad2string } from '../../../utils/rad2string';
import { x2lon } from '../../../utils/x2lon';
import { xyz2latLon } from '../../../utils/xyz2latLon';
import { y2lat } from '../../../utils/y2lat';

class SavedPositions extends Container {
  static item2xyz = (item: XYZ) => castObject(item, {
    x: val => Number(val) / tileSize,
    y: val => Number(val) / tileSize,
    z: Number,
  });
  constructor () {
    super();

    const list = this.localStorageItem.get();
    if (Array.isArray(list)) {
      list.forEach(({ x, y, z }) => {
        const check = x + y + z;
        if (typeof check === 'number' && !Number.isNaN(check)) this.add(SavedPositions.item2xyz({ x, y, z }));
        else console.log('x, y, or z is NaN', list);
      });
    }
    else console.log('savedPositions not an array');
    this.localStorageItem.set([...this.list.values()]);

    position.listeners.add(() => this.refresh());
    this.refresh();
  }

  private readonly list = new Map<string, XYZ>();
  private readonly localStorageItem = new LocalStorageItem<XYZ[]>('savedPositions');

  add ({ x, y, z }: XYZ) {
    this.edit({ func: 'add', x, y, z });
  }
  delete ({ x, y, z }: XYZ) {
    this.edit({ func: 'delete', x, y, z });
  }
  refresh () {
    this.clear();
    this.list.forEach(item => {
      const { x, y, z } = SavedPositions.item2xyz(item);
      const distanceContainer = new Distance(xyz2latLon({ x, y, z }));

      distanceContainer.reference = position;
      this.append(
        Container.from('div', {
          classes: ['btn-group', 'my-2', 'd-flex'],
          role: 'group',
        })
        .append(
          Container.from('a', {
            classes: ['btn', 'btn-secondary', 'text-start'],
            onclick: () => {
              position.xyz = { x, y, z };
            },
            role: 'button',
          })
          .append(
            [
              rad2string({ axis: 'NS', pad: 2, phi: y2lat(y, 1 << z) }),
              rad2string({ axis: 'EW', pad: 3, phi: x2lon(x, 1 << z) }),
              `(${z})`,
            ].join(' '),
            distanceContainer.spacer,
            distanceContainer,
          ),
          new IconButton({
            icon: 'x',
            onclick: () => {
              this.delete({ x, y, z });
            },
          }),
        ),
      );
    });
  }
  private edit ({ func, x, y, z }: XYZ & { func: 'add' | 'delete'; }) {
    const xyz = {
      x: round(x * tileSize),
      y: round(y * tileSize),
      z,
    };
    const id = stringify(xyz);
    if (func === 'add') this.list.set(id, xyz);
    else if (func === 'delete') this.list.delete(id);
    this.localStorageItem.set([...this.list.values()]);
    this.refresh();
  }
}

export const savedPositions = new SavedPositions;
