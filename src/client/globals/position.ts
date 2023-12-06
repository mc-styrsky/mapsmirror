import type { XYZ } from '../../common/types/xyz';
import { extractProperties } from '../../common/extractProperties';
import { modulo } from '../../common/modulo';


class Position {
  constructor ({ ttl, x, y, z }: XYZ & { ttl: number }) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._ttl = ttl;
    this._tiles = 1 << z;
    this.map = { x, y, z };
  }
  set ttl (val: number) {
    this._ttl = val;
  }
  get ttl () {
    return this._ttl;
  }
  set x (val: XYZ['x']) {
    this._x = modulo(val, this._tiles);
  }
  get x () {
    return this._x;
  }
  set y (val: XYZ['y']) {
    this._y = Math.max(0, Math.min(val, this._tiles));
  }
  get y () {
    return this._y;
  }
  set z (val: XYZ['z']) {
    this._z = val;
    this._tiles = 1 << val;
  }
  get z () {
    return this._z;
  }
  set xyz ({ x, y, z }: XYZ) {
    this.z = z;
    this.x = x;
    this.y = y;
  }
  get xyz () {
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
      this.z++;
      this.x *= 2;
      this.y *= 2;
      return true;
    }
    return false;
  };
  readonly zoomOut = () => {
    if (this.z > 2) {
      this.z--;
      this.x /= 2;
      this.y /= 2;
      return true;
    }
    return false;
  };

  readonly map: XYZ;
  user = {
    accuracy: 0,
    latitude: 0,
    longitude: 0,
    timestamp: 0,
  };
  private _ttl: number;
  private _x: XYZ['x'];
  private _y: XYZ['y'];
  private _z: XYZ['z'];
  private _tiles: number;
}

export const position = new Position(extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  ttl: val => parseInt(val ?? 0),
  x: val => parseFloat(val ?? 2),
  y: val => parseFloat(val ?? 2),
  z: val => parseInt(val ?? 2),
}));
