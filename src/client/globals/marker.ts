import { lat2y } from '../utils/lat2y';
import { lon2x } from '../utils/lon2x';
import { position } from './position';


export class Marker {
  constructor ({ id = '', lat, lon, type }: { id?: string; lat: number; lon: number; type: Marker['type']; }) {
    this.lat = lat * Math.PI / 180;
    this.lon = lon * Math.PI / 180;
    this.type = type;
    this.id = id;
    position.markers.set(type, this);
  }
  lat: number;
  lon: number;
  readonly id: string;
  get x () {
    return lon2x(this.lon);
  }
  get y () {
    return lat2y(this.lat);
  }
  type: 'user' | 'navionics';
  delete () {
    position.markers.delete(this.type);
  }
}
