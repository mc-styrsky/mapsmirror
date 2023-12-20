import type { Baselayer } from '../../common/types/layers';
import { modulo } from '../../common/modulo';
import { position } from '../globals/position';
import { settings } from '../globals/settings';
import { tileSize } from '../globals/tileSize';
import { boundingRect } from '../index';
import { createHTMLElement } from '../utils/createHTMLElement';
import { LocalStorageItem } from '../utils/localStorageItem';
import { rad2deg } from '../utils/rad2deg';
import { x2lon } from '../utils/x2lon';
import { y2lat } from '../utils/y2lat';
import { createCrosshairsCanvas } from './canvases/crosshairs';
import { createNetCanvas } from './canvases/net';
import { updateInfoBox } from './infoBox/updateInfoBox';
import { MapTile } from './map/mapTile';
import { BaselayerMenu, baselayerMenu } from './menu/baselayerMenu';
import { overlayContainer } from './overlayContainer';

export class MapContainer {
  private mapTiles = new Map<string, MapTile>();

  set baselayer (baselayer: Baselayer) {
    settings.baselayer = baselayer;
    baselayerMenu.baselayerLabel = BaselayerMenu.baselayerLabel(baselayer);
    this.clear();
    mapContainer.redraw('changed baselayer');
  }

  html = createHTMLElement('div', {
    style: {
      height: '100%',
      left: '0px',
      overflow: 'hidden',
      position: 'absolute',
      top: '0px',
      width: '100%',
      zIndex: '-200',
    },
    zhilds: [],
  });

  clear () {
    this.mapTiles.clear();
  }

  redraw (type: string) {
    const { height, width } = boundingRect;

    const { tiles, ttl, x, y, z } = position;

    const crosshairs = createCrosshairsCanvas({ height, width, x, y });
    const net = createNetCanvas({ height, width, x, y });
    overlayContainer.innerHTML = '';
    overlayContainer.append(crosshairs, net);


    updateInfoBox();

    console.log(`${type} redraw@${new Date().toISOString()}`);


    const maxdx = Math.ceil(x + width / 2 / tileSize);
    const maxdy = Math.ceil(y + height / 2 / tileSize);
    const mindx = Math.floor(x - width / 2 / tileSize);
    const mindy = Math.floor(y - height / 2 / tileSize);

    const txArray: number[] = [];
    for (let tx = mindx; tx < maxdx; tx++) {
      txArray.push(modulo(tx, tiles));
    }
    const tyArray: number[] = [];
    for (let ty = mindy; ty < maxdy; ty++) {
      if (ty >= 0 && ty < tiles) tyArray.push(ty);
    }

    const tileIds = new Map<string, {x: number, y: number, z: number}>();
    for (let tz = 2; tz <= z; tz++) {
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

    this.html.innerHTML = '';
    [...tileIds.entries()]
    .sort(([a], [b]) => a > b ? 1 : -1)
    .forEach(([id, xyz]) => {
      const tile = this.mapTiles.get(id) ?? (() => {
        const t = new MapTile(xyz);
        this.mapTiles.set(t.id, t);
        return t;
      })();
      this.html.append(tile.toHtml());
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
      new LocalStorageItem<typeof settings>('settings').set(settings);
    })();
  }

  toHtml () {
    return this.html;
  }
}

export const mapContainer = new MapContainer();
