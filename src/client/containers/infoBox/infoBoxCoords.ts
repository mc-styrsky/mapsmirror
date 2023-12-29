import { mouse } from '../../globals/mouse';
import { position } from '../../globals/position';
import { tileSize } from '../../globals/tileSize';
import { boundingRect } from '../../index';
import { Container } from '../../utils/htmlElements/container';
import { px2nm } from '../../utils/px2nm';
import { rad2string } from '../../utils/rad2string';
import { x2lon } from '../../utils/x2lon';
import { y2lat } from '../../utils/y2lat';

export class InfoBoxCoords extends Container {
  constructor () {
    super();
    const { height, width } = boundingRect;

    const { x, y } = position;

    const lat = y2lat(y);
    const lon = x2lon(x);
    const latMouse = y2lat(y + (mouse.y - height / 2) / tileSize);
    const lonMouse = x2lon(x + (mouse.x - width / 2) / tileSize);

    const scale = (() => {
      let nm = px2nm(lat);
      let px = 1;

      if (nm >= 1) return `${px2nm(lat).toPrecision(3)}nm/px`;
      while (nm < 1) {
        nm *= 10;
        px *= 10;
      }
      return `${nm.toPrecision(3)}nm/${px.toFixed(0)}px`;
    })();


    this.row('Scale', `${scale} (Zoom ${position.z})`);
    this.row('Lat/Lon', `${rad2string({ axis: 'NS', pad: 2, phi: lat })} ${rad2string({ axis: 'EW', pad: 3, phi: lon })}`);
    this.row('Mouse', `${rad2string({ axis: 'NS', pad: 2, phi: latMouse })} ${rad2string({ axis: 'EW', pad: 3, phi: lonMouse })}`);
    this.row(
      'User',
      `${
        rad2string({ axis: 'NS', pad: 2, phi: position.user.latitude })
      } ${
        rad2string({ axis: 'EW', pad: 3, phi: position.user.longitude })
      }`,
    );
  }
  private row (left: string, right: string) {
    this.append(
      Container.from('div', {
        classes: [
          'd-flex',
          'w-100',
        ],
      })
      .append(
        Container.from('div', { classes: ['mrA'] }).append(left),
        Container.from('div', { classes: ['mlA'] }).append(right),
      ),
    );
  }
}
