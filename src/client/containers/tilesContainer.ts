import type { Baselayer } from '../../common/types/layer';
import { zoomMin } from '../../common/layers';
import { ceil, floor } from '../../common/math';
import { position } from '../globals/position';
import { Settings } from '../globals/settings';
import { tileSize } from '../globals/tileSize';
import { MainContainer } from '../mainContainer';
import { Container } from '../utils/htmlElements/container';
import { MonoContainer } from '../utils/htmlElements/monoContainer';
import { LocalStorageItem } from '../utils/localStorageItem';
import { rad2deg } from '../utils/rad2deg';
import { x2lon } from '../utils/x2lon';
import { y2lat } from '../utils/y2lat';
import { MapTile } from './map/mapTile';
import { BaselayerMenu } from './menu/baselayerMenu';

export class TilesContainer extends MonoContainer {
  private static mapTiles = new Map<string, MapTile>();

  static rebuild (type: string) {
    this.mapTiles.clear();
    this.refresh(type);
  }

  static set baselayer (baselayer: Baselayer) {
    Settings.baselayer = baselayer;
    BaselayerMenu.baselayerLabel = baselayer;
    this.rebuild('changed baselayer');
  }

  static refresh (type: string) {
    console.log(`${type} redraw@${new Date().toISOString()}`);

    const { height, width } = MainContainer;
    const { tiles, ttl, x, y, z } = position;

    const maxdx = ceil(x + width / 2 / tileSize);
    const maxdy = ceil(y + height / 2 / tileSize);
    const mindx = floor(x - width / 2 / tileSize);
    const mindy = floor(y - height / 2 / tileSize);

    const txArray: number[] = [];
    for (let tx = mindx; tx < maxdx; tx++) {
      txArray.push(tx);
      if (tx < 0) txArray.push(tx + tiles);
      if (tx > tiles) txArray.push(tx - tiles);
      // txArray.push(modulo(tx, tiles));
    }
    const tyArray: number[] = [];
    for (let ty = mindy; ty < maxdy; ty++) {
      if (ty >= 0 && ty < tiles) tyArray.push(ty);
    }

    const tileIds = new Map<string, {x: number, y: number, z: number}>();
    for (let tz = zoomMin; tz <= z; tz++) {
      txArray.forEach(tx => {
        tyArray.forEach(ty => {
          const xyz = {
            x: tx >> z - tz,
            y: ty >> z - tz,
            z: tz,
          };
          const id = MapTile.id(xyz);
          tileIds.set(id, xyz);
        });
      });
    }

    this.clear();
    const sortedTiles = [...tileIds.entries()]
    .sort(([, a], [, b]) => {
      if (a.z === b.z) return MapTile.distance(a, position) - MapTile.distance(b, position);
      if (a.z === z) return 1;
      if (b.z === z) return -1;
      if (a.z > z && b.z > z) return b.z - a.z;
      return a.z - b.z;
    });

    sortedTiles.forEach(([id, xyz]) => {
      const tile = this.mapTiles.get(id) ?? (() => {
        const t = new MapTile(xyz);
        this.mapTiles.set(t.id, t);
        return t;
      })();
      this.append(tile);
      tile.moveTo({ x, y, z });
    });

    (() => {
      const { origin, pathname, search } = window.location;
      const newsearch = `?${[
        ['z', z],
        ['ttl', ttl],
        ['lat', rad2deg(y2lat(y)).toFixed(5)],
        ['lon', rad2deg(x2lon(x)).toFixed(5)],
      ]
      .map(([k, v]) => `${k}=${v}`)
      .join('&')}`;
      if (newsearch !== search) {
        const newlocation = `${origin}${pathname}${newsearch}`;
        window.history.pushState({ path: newlocation }, '', newlocation);
      }
      new LocalStorageItem<typeof Settings>('settings').set(Settings);
    })();
  }

  static {
    this.copyInstance(new Container('div', {
      classes: ['MapContainerStyle'],
      id: TilesContainer.name,
    }), this);
    window.addEventListener('resize', () => this.refresh('resize'));
    position.listeners.add(() => this.refresh('position'));
    this.rebuild('initial');
  }
}
