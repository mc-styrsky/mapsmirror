import type BootstrapIcons from 'bootstrap-icons/font/bootstrap-icons.json';
import { mapContainer } from '../../containers/mapContainer';
import { Container } from './container';

interface BsIcon {
  fontSize?: string;
  icon: keyof(typeof BootstrapIcons);
  src?: undefined;
}
interface SvgIcon {
  fontSize?: undefined;
  icon?: undefined;
  src: string;
}

export class BootstrapIcon extends Container<HTMLElement> {
  constructor ({ fontSize = '175%', icon }: BsIcon) {
    super(Container.from('i', {
      classes: [`bi-${icon}`],
      style: { fontSize },
    }));
  }
}

export class IconButton extends Container<HTMLAnchorElement> {
  constructor ({
    active = () => false, fontSize, icon, onclick = () => void 0, src, style,
  }: {
    active?: () => boolean,
    onclick?: () => void;
    style?: Partial<HTMLAnchorElement['style']>;
  } & (BsIcon | SvgIcon)) {
    super(Container.from('a', {
      classes: ['btn', active() ? 'btn-success' : 'btn-secondary'],
      role: 'button',
      style: {
        padding: '0.25rem',
        ...style,
      },
    }));
    this.append(
      icon ?
        new BootstrapIcon({ fontSize, icon }) :
        Container.from('img', {
          src,
          style: {
            height: '1.75rem',
          },
        }),
    );

    this.html.onclick = () => {
      onclick();
      if (active()) {
        this.html.classList.add('btn-success');
        this.html.classList.remove('btn-secondary');
      }
      else {
        this.html.classList.add('btn-secondary');
        this.html.classList.remove('btn-success');
      }
      mapContainer.clear();
      mapContainer.redraw('icon clicked');
    };
  }
}
