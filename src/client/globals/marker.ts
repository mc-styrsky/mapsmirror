import { lat2y } from '../utils/lat2y';
import { lon2x } from '../utils/lon2x';

export type MarkerConstructorParameters = {
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

class Markers {
  readonly _markers: Map<Marker['type'], Marker> = new Map();

  add = (params: MarkerConstructorParameters) => {
    this._markers.set(params.type, new Marker(params));
    this.refresh();
  };
  delete = (type: Marker['type']) => {
    if (this._markers.has(type)) {
      this._markers.delete(type);
      this.refresh();
    }
  };
  get = (type: Marker['type']) => this._markers.get(type);
  set = () => this._markers;

  readonly listeners = new Set<() => void>();
  refresh () {
    this.listeners.forEach(callback => callback());
  }
}

export const markers = new Markers();
