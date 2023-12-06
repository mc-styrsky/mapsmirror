import { redraw } from '../../redraw';
import { createHTMLElement } from '../../utils/createHTMLElement';

export const iconButton = ({ active, onclick, src, style }: { active: () => boolean, onclick: () => void; src: string; style?: Partial<HTMLAnchorElement['style']>; }) => {
  const ret = createHTMLElement({
    classes: ['btn', active() ? 'btn-success' : 'btn-secondary'],
    role: 'button',
    style: {
      padding: '0.25rem',
      ...style,
    },
    tag: 'a',
    zhilds: [
      createHTMLElement({
        src,
        style: {
          color: '#ff0000',
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
};
