import type BootstrapIcons from 'bootstrap-icons/font/bootstrap-icons.json';
import { Container } from '../container';
import { mapContainer } from '../mapContainer';

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
  return Container.from('i', {
    classes: [`bi-${icon}`],
    style: { fontSize },
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
  const ret = Container.from('a', {
    classes: ['btn', active() ? 'btn-success' : 'btn-secondary'],
    role: 'button',
    style: {
      padding: '0.25rem',
      ...style,
    },
  })
  .append(
    icon ?
      bootstrapIcon({ fontSize, icon }) :
      Container.from('img', {
        src,
        style: {
          height: '1.75rem',
        },
      }),
  );

  ret.html.onclick = () => {
    onclick();
    if (active()) {
      ret.html.classList.add('btn-success');
      ret.html.classList.remove('btn-secondary');
    }
    else {
      ret.html.classList.add('btn-secondary');
      ret.html.classList.remove('btn-success');
    }
    mapContainer.clear();
    mapContainer.redraw('icon clicked');
  };

  return ret;
}
