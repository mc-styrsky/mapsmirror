import type BootstrapIcons from 'bootstrap-icons/font/bootstrap-icons.json';
import { redraw } from '../../redraw';
import { createHTMLElement } from '../../utils/createHTMLElement';

interface BootstrapIcon {
  fontSize?: string;
  icon: keyof(typeof BootstrapIcons);
  src?: undefined;
}
interface SvgIcon {
  fontSize?: undefined;
  icon?: undefined;
  src: string;
}

export function bootstrapIcon ({ fontSize = '175%', icon }: BootstrapIcon) {
  return createHTMLElement({
    classes: [`bi-${icon}`],
    style: { fontSize },
    tag: 'i',
  });
}

type IconButton = {
  active?: () => boolean,
  onclick?: () => void;
  style?: Partial<HTMLAnchorElement['style']>;
} & (BootstrapIcon | SvgIcon)

export function iconButton ({
  active = () => false, fontSize, icon, onclick = () => void 0, src, style,
}: IconButton) {
  const ret = createHTMLElement({
    classes: ['btn', active() ? 'btn-success' : 'btn-secondary'],
    role: 'button',
    style: {
      padding: '0.25rem',
      ...style,
    },
    tag: 'a',
    zhilds: [
      icon ?
        bootstrapIcon({ fontSize, icon }) :
        createHTMLElement({
          src,
          style: {
            height: '1.75rem',
          },
          tag: 'img',
        }),
    ],
  });

  ret.onclick = () => {
    onclick();
    if (active()) {
      ret.classList.add('btn-success');
      ret.classList.remove('btn-secondary');
    }
    else {
      ret.classList.add('btn-secondary');
      ret.classList.remove('btn-success');
    }
    redraw('icon clicked');
  };

  return ret;
}
