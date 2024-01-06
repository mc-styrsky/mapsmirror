import { lat2y } from '../utils/lat2y';
import { lon2x } from '../utils/lon2x';

export interface MarkerConstructorParameters {
  accuracy?: number;
  lat: number;
  lon: number;
  timestamp?: number;
  type: Marker['type'];
}

class Marker {
  constructor ({
    accuracy = 0,
    lat,
    lon,
    timestamp = 0,
    type,
  }: MarkerConstructorParameters) {
    this.accuracy = accuracy;
    this.timestamp = timestamp;
    this.lat = lat;
    this.lon = lon;
    this.type = type;
  }

  readonly accuracy: number;
  readonly timestamp: number;
  readonly lat: number;
  readonly lon: number;
  readonly type: 'user' | 'navionics';

  get x () {
    return lon2x(this.lon);
  }
  get y () {
    return lat2y(this.lat);
  }
}

export class Markers {
  static readonly _markers = new Map<Marker['type'], Marker>();
  static readonly listeners = new Set<() => void>();

  static add = (params: MarkerConstructorParameters) => {
    this._markers.set(params.type, new Marker(params));
    this.refresh();
  };
  static delete = (type: Marker['type']) => {
    if (this._markers.has(type)) {
      this._markers.delete(type);
      this.refresh();
    }
  };
  static get = (type: Marker['type']) => this._markers.get(type);
  static set = () => this._markers;

  static refresh () {
    this.listeners.forEach(callback => callback());
  }
}
