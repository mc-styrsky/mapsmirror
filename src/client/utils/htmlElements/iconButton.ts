import type BootstrapIcons from 'bootstrap-icons/font/bootstrap-icons.json';
import { TilesContainer } from '../../containers/tilesContainer';
import { Stylesheet } from '../../globals/stylesheet';
import { Container } from './container';

interface BsIcon {
  icon: keyof(typeof BootstrapIcons);
  src?: undefined;
}
interface SvgIcon {
  icon?: undefined;
  src: string;
}

Stylesheet.addClass({
  BootstrapIcon: { fontSize: '175%' },
  IconButton: {
    flexGrow: '0',
    flexShrink: '0',
    padding: '0.25rem',
  },
  SvgIcon: {
    height: '1.75rem',
  },
});

export class BootstrapIcon extends Container<'i'> {
  constructor ({ icon }: BsIcon) {
    super('i', {
      classes: ['BootstrapIcon', `bi-${icon}`],
    });
  }
}

export class IconButton extends Container<'a'> {
  constructor ({
    active = () => false, icon, onclick = () => void 0, src,
  }: {
    active?: () => boolean,
    onclick?: () => void;
    // style?: Partial<HTMLAnchorElement['style']>;
  } & (BsIcon | SvgIcon)) {
    super('a', {
      classes: ['btn', active() ? 'btn-success' : 'btn-secondary', 'IconButton'],
      role: 'button',
    });
    this.append(
      icon ?
        new BootstrapIcon({ icon }) :
        new Container('img', {
          classes: ['SvgIcon'],
          src,
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
      TilesContainer.refresh('icon clicked');
    };
  }
}
