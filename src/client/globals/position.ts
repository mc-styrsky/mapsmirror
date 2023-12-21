import type { Marker } from './marker';
import type { XYZ } from '../../common/types/xyz';
import { extractProperties } from '../../common/extractProperties';
import { zoomMax, zoomMin } from '../../common/layers';
import { modulo } from '../../common/modulo';
import { overlayContainer } from '../containers/overlayContainer';
import { deg2rad } from '../utils/deg2rad';
import { lat2y } from '../utils/lat2y';
import { lon2x } from '../utils/lon2x';
import { mouse } from './mouse';
import { navionicsDetails } from './navionicsDetails';


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
    this._y = Math.max(0, Math.min(y, this._tiles));
    setTimeout(() => overlayContainer.redraw(), 1);
    if (!mouse.down.state) setTimeout(() => navionicsDetails.fetch(this), 100);
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

  readonly zoomIn = () => {
    if (this._z < zoomMax) {
      this.xyz = {
        x: this._x * 2,
        y: this._y * 2,
        z: this._z + 1,

      };
      return true;
    }
    return false;
  };
  readonly zoomOut = () => {
    if (this.z > zoomMin) {
      this.xyz = {
        x: this._x /= 2,
        y: this._y /= 2,
        z: this._z - 1,
      };
      return true;
    }
    return false;
  };

  readonly map: XYZ;
  readonly markers: Map<Marker['type'], Marker> = new Map();
  user = {
    accuracy: 0,
    latitude: 0,
    longitude: 0,
    timestamp: 0,
  };
  private _ttl: number;
  private _x: XYZ['x'] = 0;
  private _y: XYZ['y'] = 0;
  private _z: XYZ['z'] = 0;
  private _tiles: number = 0;
}

const searchParams = Object.fromEntries(new URL(window.location.href).searchParams.entries());
const { lat, lon, ttl, z } = extractProperties(searchParams, {
  lat: val => Number(val) ? deg2rad(parseFloat(val)) : 0,
  lon: val => Number(val) ? deg2rad(parseFloat(val)) : 0,
  ttl: val => Number(val) ? parseInt(val) : 0,
  z: val => Number(val) ? parseInt(val) : 2,
});

export const position: Position = new Position({
  ttl,
  x: lon2x(lon, 1 << z),
  y: lat2y(lat, 1 << z),
  z,
});
