import type { Marker } from './marker';
import type { XYZ } from '../../common/types/xyz';
import { extractProperties } from '../../common/extractProperties';
import { modulo } from '../../common/modulo';
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
    setTimeout(() => navionicsDetails.fetch(this), 100);
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
    if (this._z < 20) {
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
    if (this.z > 2) {
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

export const position = new Position(extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  ttl: val => parseInt(val ?? 0),
  x: val => parseFloat(val ?? 2),
  y: val => parseFloat(val ?? 2),
  z: val => parseInt(val ?? 2),
}));
