import type { INavionicsItemRefresh, NavionicsItemNode } from './accordionItem/navionicsItemNode';
import type { XYZ } from '../../../../common/types/xyz';
import { extractProperties } from '../../../../common/extractProperties';
import { tileSize } from '../../../globals/tileSize';
import { deg2rad } from '../../../utils/deg2rad';
import { Container } from '../../../utils/htmlElements/container';
import { lat2y } from '../../../utils/lat2y';
import { lon2x } from '../../../utils/lon2x';
import { px2nm } from '../../../utils/px2nm';
import { NavionicsGoto } from './accordionItem/goto';
import { NavionicsIcon } from './accordionItem/icon';
import { NavionicsItemDetails } from './accordionItem/itemDetails';
import { NavionicsItemLabel } from './accordionItem/label';
import { NavionicsHead } from './accordionItem/navionicsHead';
import { NavionicsItemSpinner } from './accordionItem/spinner';

export interface NavionicsDetailConstructor {
  category_id: string;
  label?: string;
  properties?: string[];
  details: boolean;
  distance: number;
  icon_id: string;
  id: string;
  name: string;
  position: {
    lat: number;
    lon: number;
  };
}


export class AccordionItem extends Container {
  constructor (item: NavionicsDetailConstructor) {
    super(Container.from('div', {
      classes: [
        'accordion-item',
        'mm-menu-text',
      ],
    }));
    const {
      category_id: categoryId,
      details,
      icon_id: iconId,
      id: itemId,
      name: itemName,
      position,
    } = extractProperties(item, {
      category_id: String,
      details: Boolean,
      icon_id: String,
      id: String,
      name: String,
      position: ({ lat, lon }) => ({
        lat: deg2rad(lat),
        lon: deg2rad(lon),
        x: lon2x(deg2rad(lon)),
        y: lat2y(deg2rad(lat)),
      }),
    });

    this.categoryId = categoryId;
    this.details = details;
    this.iconId = iconId;
    this.itemId = itemId;
    this.itemName = itemName;
    this.position = position;
    this.distance = 0;

    this.append(
      Container.from('div', {
        classes: [
          'accordion-header',
          'mm-menu-text',
        ],
      })
      .append(
        this.nodes.add(new NavionicsHead(this))
        .append(
          Container.from('div', {
            classes: ['d-flex'],
            style: {
              width: '100%',
            },
          })
          .append(
            this.nodes.add(new NavionicsIcon(this)),
            this.nodes.add(new NavionicsItemLabel(this)),
            item.position ? new NavionicsGoto(this) : null,
            item.details ?
              this.nodes.add(new NavionicsItemSpinner()) :
              Container.from('div', {
                style: {
                  width: 'var(--bs-accordion-btn-icon-width)',
                },
              }),
          ),
        ),
      ),
    );
    if (item.details) this.append(this.nodes.add(new NavionicsItemDetails(this)));
  }

  categoryId: string;
  label?: string;
  properties?: string[];
  details: boolean;
  distance: number;
  iconId: string;
  itemId: string;
  itemName: string;
  position: {
    lat: number;
    lon: number;
    x: number;
    y: number;
  };

  readonly nodes = new NavionicsItemNodes();


  setReference ({ x, y }: Pick<XYZ, 'x'|'y'>) {
    const pdx = this.position.x - x;
    const pdy = this.position.y - y;
    this.distance = Math.sqrt(pdx * pdx + pdy * pdy) * tileSize * px2nm(this.position.lat);
  }

  refresh () {
    this.nodes.refresh({ item: this });
  }
}
export class NavionicsItemNodes {
  nodes = new Set<NavionicsItemNode>();

  add (node: Container) {
    this.nodes.add(node);
    return node;
  }
  refresh (params: INavionicsItemRefresh) {
    this.nodes.forEach(node => node.refresh?.(params));
  }
}
