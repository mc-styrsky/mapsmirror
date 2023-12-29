import type { XYZ } from '../../../../common/types/xyz';
import { castObject } from '../../../../common/extractProperties';
import { stylesheet } from '../../../globals/stylesheet';
import { tileSize } from '../../../globals/tileSize';
import { AccordionItem } from '../../../utils/htmlElements/accordion/accordionItem';
import { Container } from '../../../utils/htmlElements/container';
import { px2nm } from '../../../utils/px2nm';
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
  position: {
    lat: number;
    lon: number;
    x: number;
    y: number;
  };
}

stylesheet.addClass({
  NavionicsItemSpacer: {
    flexGrow: '0',
    flexShrink: '0',
    width: 'var(--bs-accordion-btn-icon-width)',
  },
});

stylesheet.addClass({
});

export class NavionicsItem extends AccordionItem {
  constructor ({
    details,
    iconId,
    itemId,
    itemName,
    position,
  }: NavionicsItemConstructor) {
    const labelContainer = new NavionicsItemLabel(itemName);
    const headLabel = Container.from('div', {
      classes: ['d-flex', 'w-100'],
    })
    .append(
      new NavionicsIcon(iconId),
      labelContainer,
      position ? new NavionicsGoto(position) : null,
      details ?
        void 0 :
        Container.from('div', {
          classes: ['NavionicsItemSpacer'],
        }),
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


    this.itemId = itemId;
    this.labelContainer = labelContainer;
    this.position = position;
  }

  get distance () {
    return this._distance;
  }
  readonly itemId: string;
  private _distance: number = NaN;
  private readonly position: NavionicsItemConstructor['position'];
  readonly labelContainer: NavionicsItemLabel;


  setReference ({ x, y }: Pick<XYZ, 'x'|'y'>) {
    const pdx = this.position.x - x;
    const pdy = this.position.y - y;
    this._distance = Math.sqrt(pdx * pdx + pdy * pdy) * tileSize * px2nm(this.position.lat);
    this.labelContainer.setDistance(
      `${this.distance.toFixed(3)}nm`,
    );
  }
}
