import { floor, log10, pow } from '../../common/math';
import { position } from '../globals/position';
import { Container } from '../utils/htmlElements/container';
import { MonoContainer } from '../utils/htmlElements/monoContainer';
import { nm2px } from '../utils/nm2px';


class ScaleUnitContainer extends Container {
  constructor ({
    align = 'bottom',
    nautMiles = 1,
    siPrefixes = false,
    unit = 'nm',
  }:{
    unit?: string;
    nautMiles?: number;
    siPrefixes?: boolean;
    align?: 'top' | 'bottom';
  } = {},
  ) {
    super('div', {
      classes: [
        'position-relative',
        'd-flex',
      ],
    });

    this.unit = unit;
    this.nautMiles = nautMiles;
    this.siPrefixes = siPrefixes;

    if (align === 'top') this.scale.style = {
      borderBottomWidth: '0px',
      borderTopWidth: '1px',
      marginTop: '-1px',
      top: '0',
    };
    else this.scale.style = {
      borderBottomWidth: '1px',
      borderTopWidth: '0px',
      bottom: '0',
    };
    this.append(
      this.label,
      this.scale,
    );
  }
  private readonly unit: string;
  private readonly nautMiles: number;
  private readonly siPrefixes: boolean;
  readonly label = new Container('div', { classes: ['px-1'] });
  readonly scale = new Container('div', {
    classes: ['position-absolute'],
    style: {
      borderBottomWidth: '1px',
      borderLeftWidth: '1px',
      borderRightWidth: '1px',
      borderStyle: 'solid',
      borderTopWidth: '0',
      height: '10px',
    },
  });
  refresh (targetWidth = 20) {
    const { lat } = position;
    const baseWidth = nm2px(lat) / this.nautMiles;
    let zeros = floor(log10(targetWidth) - log10(baseWidth));
    let width = baseWidth * pow(10, zeros);
    let count = 1;

    const getText = () => {
      const { prefix, retZeros } =
      this.siPrefixes && zeros >= 3 ?
        { prefix: 'k', retZeros: zeros - 3 } :
        { prefix: '', retZeros: zeros };
      return retZeros < 0 ?
        `0.${'0'.repeat(-1 - retZeros)}${count}${prefix ?? ''}${this.unit}` :
        `${count}${'0'.repeat(retZeros)}${prefix ?? ''}${this.unit}`;
    };


    if (targetWidth / width > 5) {
      width *= 10;
      zeros++;
    }
    else if (targetWidth / width > 2) {
      width *= 5;
      count = 5;
    }
    else {
      width *= 2;
      count = 2;
    }

    const text = getText();
    this.label.clear();
    console.log(this.label.html.clientWidth);
    this.label.append(text);
    this.scale.style = { width: `${width}px` };
    const { clientWidth } = this.label.html;
    console.log({ clientWidth, targetWidth, text, width });
    if (width < clientWidth) {
      this.refresh(targetWidth * 2);
    }
  }
}

export class ScaleContainer extends MonoContainer {
  static nautMiles = new ScaleUnitContainer();
  static meters = new ScaleUnitContainer({
    align: 'top',
    nautMiles: 1852,
    siPrefixes: true,
    unit: 'm',
  });
  static refresh () {
    this.nautMiles.refresh();
    this.meters.refresh();
  }
  static {
    this.copyInstance(new Container('div', {
      classes: ['position-absolute'],
      style: {
        bottom: '2rem',
        left: '2rem',
      },
    }), this);
    this.append(
      this.nautMiles,
      this.meters,
    );
    position.listeners.add(() => this.refresh());
  }
}
