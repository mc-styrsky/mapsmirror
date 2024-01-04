import type { XYZ } from '../../common/types/xyz';
import type { LatLon } from '../utils/spheric/latLon';
import { castObject } from '../../common/extractProperties';
import { fromEntriesTyped } from '../../common/fromEntriesTyped';
import { zoomMax, zoomMin } from '../../common/layers';
import { max, min } from '../../common/math';
import { modulo } from '../../common/modulo';
import { deg2rad } from '../utils/deg2rad';
import { lat2y } from '../utils/lat2y';
import { lon2x } from '../utils/lon2x';
import { x2lon } from '../utils/x2lon';
import { y2lat } from '../utils/y2lat';


class Position {
  constructor ({ ttl, x, y, z }: XYZ & { ttl: number }) {
    this.xyz = { x, y, z };
    this._ttl = ttl;
    this.map = { x, y, z };
  }
  set ttl (val: number) {
    this._ttl = val;
  }
  get ttl () {
    return this._ttl;
  }
  get lat () {
    return this._lat;
  }
  get lon () {
    return this._lon;
  }
  get x () {
    return this._x;
  }
  get y () {
    return this._y;
  }
  get z () {
    return this._z;
  }
  set xyz ({ x = this._x, y = this._y, z = this._z }: Partial<XYZ>) {
    this._z = z;
    this._tiles = 1 << z;
    this._x = modulo(x, this._tiles);
    this._y = max(0, min(y, this._tiles));
    this._lat = y2lat(y, 1 << z);
    this._lon = x2lon(x, 1 << z);
    this.refresh();
  }
  get xyz (): XYZ {
    return {
      x: this._x,
      y: this._y,
      z: this._z,
    };
  }
  get tiles () {
    return this._tiles;
  }

  readonly zoomIn = ({ dx = 0, dy = 0 }: {dx?: number, dy?: number} = {}) => {
    if (this._z < zoomMax) {
      this.xyz = {
        x: this._x * 2 + dx,
        y: this._y * 2 + dy,
        z: this._z + 1,

      };
      return true;
    }
    return false;
  };
  readonly zoomOut = ({ dx = 0, dy = 0 }: {dx?: number, dy?: number} = {}) => {
    if (this.z > zoomMin) {
      this.xyz = {
        x: (this._x - dx) / 2,
        y: (this._y - dy) / 2,
        z: this._z - 1,
      };
      return true;
    }
    return false;
  };

  readonly listeners = new Set<() => void>();
  refresh () {
    this.listeners.forEach(callback => callback());
  }

  readonly map: XYZ;
  private _lat: LatLon['lat'] = NaN;
  private _lon: LatLon['lon'] = NaN;
  private _ttl = NaN;
  private _x: XYZ['x'] = NaN;
  private _y: XYZ['y'] = NaN;
  private _z: XYZ['z'] = NaN;
  private _tiles = NaN;
}

const searchParams = fromEntriesTyped(new URL(window.location.href).searchParams.entries());
const { lat, lon, ttl, z } = castObject(searchParams, {
  lat: val => Number(val) ? deg2rad(parseFloat(String(val))) : 0,
  lon: val => Number(val) ? deg2rad(parseFloat(String(val))) : 0,
  ttl: val => Number(val) ? parseInt(String(val)) : 0,
  z: val => Number(val) ? parseInt(String(val)) : 2,
});

export const position: Position = new Position({
  ttl,
  x: lon2x(lon, 1 << z),
  y: lat2y(lat, 1 << z),
  z,
});
