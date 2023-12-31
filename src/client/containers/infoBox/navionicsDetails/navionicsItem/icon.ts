import { Stylesheet } from '../../../../globals/stylesheet';
import { Container } from '../../../../utils/htmlElements/container';

Stylesheet.addClass({
  NavionicsIconDiv: {
    display: 'flex',
    flexGrow: '0',
    flexShrink: '0',
    margin: 'auto',
    width: '2em',
  },
  NavionicsIconImg: {
    display: 'flex',
    margin: 'auto',
    maxHeight: '1.5em',
    maxWidth: '1.5em',
  },
});

export class NavionicsIcon extends Container {
  constructor (iconId: string) {
    super('div', {
      classes: ['NavionicsIconDiv'],
    });

    this.append(
      new Container('img', {
        classes: ['NavionicsIconImg'],
        src: `/navionics/icon/${encodeURIComponent(iconId)}`,
      }),
    );
  }
}
