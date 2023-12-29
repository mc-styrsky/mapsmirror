import { stylesheet } from '../../../../globals/stylesheet';
import { Container } from '../../../../utils/htmlElements/container';

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
  NavionicsItemLabelDistanceHidden: {
    display: 'inline-block',
    visibility: 'hidden',
  },
  NavionicsItemLabelDistanceVisible: {
    bottom: '0',
    marginLeft: 'auto',
    paddingBottom: '0.11rem',
    position: 'absolute',
    right: '0',
  },
});

export class NavionicsItemLabel extends Container {
  constructor (itemName: string) {
    super(Container.from('div', {
      classes: ['NavionicsItemLabel'],
    }));
    this.append(
      Container.from('div', { classes: ['myA'] }).append(
        itemName,
        this.distanceSpacer,
      ),
      this.distanceContainer,
    );
  }
  distanceContainer = Container.from('span', {
    classes: ['NavionicsItemLabelDistance', 'NavionicsItemLabelDistanceVisible'],
  });
  distance: string = 'NaN';
  distanceSpacer = Container.from('div', {
    classes: ['NavionicsItemLabelDistance', 'NavionicsItemLabelDistanceHidden'],
  });

  setDistance (distance: string) {
    if (distance !== this.distance) {
      this.distance = distance;
      this.distanceContainer.clear();
      this.distanceContainer.append(distance);
      this.distanceSpacer.clear();
      this.distanceSpacer.append(distance);
    }
  }
}
