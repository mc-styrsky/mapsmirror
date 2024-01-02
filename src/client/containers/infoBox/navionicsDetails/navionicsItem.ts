import type { LatLon } from '../../../utils/spheric/latLon';
import { castObject } from '../../../../common/extractProperties';
import { markers } from '../../../globals/marker';
import { position } from '../../../globals/position';
import { AccordionItem } from '../../../utils/htmlElements/accordion/accordionItem';
import { Container } from '../../../utils/htmlElements/container';
import { NavionicsItemDetails } from './navionicsItem/details';
import { NavionicsGoto } from './navionicsItem/goto';
import { NavionicsIcon } from './navionicsItem/icon';
import { NavionicsItemLabel } from './navionicsItem/label';

export interface NavionicsItemConstructor {
  // accordionId: string;
  details: boolean;
  iconId: string;
  itemId: string;
  itemName: string;
  itemPosition: {
    lat: number;
    lon: number;
    x: number;
    y: number;
  };
}

export class NavionicsItem extends AccordionItem {
  constructor ({
    details,
    iconId,
    itemId,
    itemName,
    itemPosition,
  }: NavionicsItemConstructor) {
    const labelContainer = new NavionicsItemLabel({ itemName, itemPosition });
    const headLabel = Container.from('div', {
      classes: ['d-flex', 'w-100'],
    })
    .append(
      new NavionicsIcon(iconId),
      labelContainer,
    );
    if (details) {
      const bodyLabel = new NavionicsItemDetails();
      super({ bodyLabel, headLabel, itemId });

      this.head.progress();
      fetch(`/navionics/objectinfo/${itemId}`)
      .then(async (res) => res.ok ? await res.json() : {})
      .catch(() => ({}))
      .then(body => {
        const { properties } = castObject(body,
          {
            properties: (val) => Array.isArray(val) ?
              val.map(({ label }) => String(label)) :
              [],
          },
        );
        bodyLabel.clear();
        if (properties) properties.forEach(prop => {
          if (prop) bodyLabel.append(Container.from('p').append(prop));
        });
        this.head.done();
        this.hide();
      });
    }
    else super({ headLabel, itemId });

    this.head.append(new NavionicsGoto(itemPosition));

    this.itemId = itemId;
    this.labelContainer = labelContainer;
    this.head.html.onmousemove = () => {
      markers.add({
        lat: itemPosition.lat,
        lon: itemPosition.lon,
        type: 'navionics',
      });
    };
    position.listeners.add(() => this.reference = position);
  }

  get distance () {
    return this._distance;
  }
  readonly itemId: string;
  private _distance: number = NaN;
  readonly labelContainer: NavionicsItemLabel;


  set reference ({ lat, lon }: LatLon) {
    this.labelContainer.distanceContainer.reference = { lat, lon };
    this._distance = this.labelContainer.distanceContainer.radiusOmega.radius;
  }
}
