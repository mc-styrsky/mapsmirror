import type { LatLon } from '../spheric/latLon';
import type { RadiusOmega } from '../spheric/radiusOmega';
import { latLon2RadiusOmega } from '../spheric/latLon2RadiusOmega';
import { Container } from './container';

class DistanceElement extends Container<'span'> {
  constructor (show: boolean) {
    super('span', {
      classes: ['NavionicsItemLabelDistance', show ? 'show' : void 0],
    });
    this.append(this.arrow, this.label);
  }

  private readonly arrow = new Container('i', { classes: ['bi-arrow-up'] });
  private readonly label = new Container('div', { classes: ['d-inline-block'] });

  set dist ({ omega, radius }: { radius: number; omega: number; }) {
    this.arrow.html.style.transform = `rotate(${omega}rad)`;
    if (radius < 0.001) {
      this.arrow.html.classList.add('d-none');
      this.arrow.html.classList.remove('d-inline-block');
    }
    else {
      this.arrow.html.classList.remove('d-none');
      this.arrow.html.classList.add('d-inline-block');
    }
    this.label.html.innerText = `${radius.toFixed(3)}nm`;
  }
}

export class Distance extends DistanceElement {
  constructor ({ lat, lon }: LatLon) {
    super(true);
    this.lat = lat;
    this.lon = lon;
  }
  readonly spacer = new DistanceElement(false);
  readonly lat: number;
  readonly lon: number;
  private _radiusOmega: RadiusOmega = {
    omega: NaN,
    radius: NaN,
  };

  get radiusOmega () {
    return this._radiusOmega;
  }

  set reference (ref: LatLon) {
    const radiusOmega = latLon2RadiusOmega({
      from: ref,
      to: this,
    });
    this._radiusOmega = radiusOmega;
    this.dist = radiusOmega;
    this.spacer.dist = radiusOmega;
  }
}
