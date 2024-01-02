import type { NavionicsItemConstructor } from '../navionicsItem';
import { stylesheet } from '../../../../globals/stylesheet';
import { Container } from '../../../../utils/htmlElements/container';
import { Distance } from '../../../../utils/htmlElements/distance';

stylesheet.addClass({
  NavionicsItemLabel: {
    display: 'flex',
    flexGrow: '1',
    position: 'relative',
  },
  NavionicsItemLabelDistance: {
    fontSize: '70%',
    paddingLeft: '0.5rem',
  },
  'NavionicsItemLabelDistance:is(.show)': {
    bottom: '0',
    marginLeft: 'auto',
    paddingBottom: '0.11rem',
    position: 'absolute',
    right: '0',
  },
  'NavionicsItemLabelDistance:not(.show)': {
    display: 'inline-block',
    visibility: 'hidden',
  },
});

export class NavionicsItemLabel extends Container {
  constructor ({ itemName, itemPosition }: Pick<NavionicsItemConstructor, 'itemName' | 'itemPosition'>,
  ) {
    super(Container.from('div', {
      classes: ['NavionicsItemLabel'],
    }));
    this.distanceContainer = new Distance(itemPosition);
    this.append(
      Container.from('div', { classes: ['myA'] }).append(
        itemName,
        this.distanceContainer.spacer,
      ),
      this.distanceContainer,
    );
  }
  readonly distanceContainer: Distance;
}
