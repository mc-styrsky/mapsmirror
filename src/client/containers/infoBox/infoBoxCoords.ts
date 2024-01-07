import type { Appendable } from '../../globals/appendable';
import { Markers } from '../../globals/marker';
import { mouse } from '../../globals/mouse';
import { position } from '../../globals/position';
import { tileSize } from '../../globals/tileSize';
import { MainContainer } from '../../mainContainer';
import { Container } from '../../utils/htmlElements/container';
import { MonoContainer } from '../../utils/htmlElements/monoContainer';
import { nm2px } from '../../utils/nm2px';
import { rad2string } from '../../utils/rad2string';
import { x2lon } from '../../utils/x2lon';
import { y2lat } from '../../utils/y2lat';
import { CoordsToggle } from '../menu/coordsToggle';

export class InfoBoxCoords extends MonoContainer {
  static {
    this.copyInstance(new Container('div'), this);
    this.refresh();
    position.listeners.add(() => this.refresh());
    CoordsToggle.listeners.add(() => this.refresh());
  }
  static refresh () {
    const { height, width } = MainContainer;

    const { lat, lon, x, y } = position;

    const latMouse = y2lat(y + (mouse.y - height / 2) / tileSize);
    const lonMouse = x2lon(x + (mouse.x - width / 2) / tileSize);

    const scaleNm = (() => {
      let nm = 1;
      let px = nm2px(lat);

      while (px >= 1000) {
        nm /= 10;
        px /= 10;
      }
      while (px < 100) {
        nm *= 10;
        px *= 10;
      }
      return `${px.toPrecision(3)}px : ${nm}nm`;
    })();


    this.clear();

    this.row(`Scale  (${position.z})`, `${scaleNm}`);
    this.row('Lat/Lon', `${rad2string({ axis: 'NS', pad: 2, phi: lat })} ${rad2string({ axis: 'EW', pad: 3, phi: lon })}`);
    this.row('Mouse', `${rad2string({ axis: 'NS', pad: 2, phi: latMouse })} ${rad2string({ axis: 'EW', pad: 3, phi: lonMouse })}`);
    const userMarker = Markers.getMarker('user');
    if (userMarker) this.row(
      'User',
      `${
        rad2string({ axis: 'NS', pad: 2, phi: userMarker.lat })
      } ${
        rad2string({ axis: 'EW', pad: 3, phi: userMarker.lon })
      }`,
    );
  }

  private static row (left: Appendable, right: Appendable) {
    this.append(
      new Container('div', {
        classes: [
          'd-flex',
          'w-100',
        ],
      })
      .append(
        new Container('div', { classes: ['mr-2'] }).append(left),
        new Container('div', { classes: ['ms-auto'] }).append(right),
      ),
    );
  }
}
