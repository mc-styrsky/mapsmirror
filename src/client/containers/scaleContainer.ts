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
      classes: ['position-relative'],
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
  readonly label = new Container('div', { classes: ['ms-2'] });
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
  refresh () {
    this.label.clear();
    const scale = (() => {
      const targetWidth = 80;
      const { lat } = position;
      let width = nm2px(lat) / this.nautMiles;
      let zeros = 0;
      while (width <= targetWidth / 10) {
        width *= 10;
        zeros++;
      }
      let count = 1;
      if (targetWidth / width < 2) {
        width *= 2;
        count = 2;
      }
      else if (targetWidth / width < 5) {
        width *= 5;
        count = 5;
      }
      else if (targetWidth / width < 10) {
        width *= 10;
        zeros++;
      }
      let prefix = '';
      if (this.siPrefixes) {
        if (zeros >= 3) {
          prefix = 'k';
          zeros -= 3;
        }
      }
      return {
        text: `${count}${'0'.repeat(zeros)}${prefix}${this.unit}`,
        width,
      };
    })();
    this.label.append(scale.text);
    this.scale.style = { width: `${scale.width}px` };
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
