import { Container } from '../../../../utils/htmlElements/container';

export class NavionicsItemLabel extends Container {
  constructor (itemName: string) {
    super(Container.from('div', {
      classes: ['d-flex'],
    }));
    this.append(
      Container.from('div', {
        style: {
          margin: 'auto',
        },
      })
      .append(itemName)
      .append(
        Container.from('div', {
          style: {
            fontSize: '70%',
            marginLeft: '0.5rem',
          },
        })
        .append(this.distanceContainer),
      ),
    );
  }
  distanceContainer = Container.from('div', {
    style: {
      fontSize: '70%',
      marginLeft: '0.5rem',
    },
  });
  distance: string = 'NaN';

  setDistance (distance: string) {
    if (distance !== this.distance) {
      this.distance = distance;
      this.distanceContainer.clear();
      this.distanceContainer.append(distance);
    }
  }
}
