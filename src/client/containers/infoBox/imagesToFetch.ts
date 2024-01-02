import type { VirtLayer } from '../../../common/types/layer';
import type { XYZ } from '../../../common/types/xyz';
import { Container } from '../../utils/htmlElements/container';

class ImagesToFetch extends Container {
  constructor () {
    super();
  }
  private xyz2string = ({ x, y, z }: XYZ) => `${z.toString(16)}_${x.toString(16)}_${y.toString(16)}`;

  private data: Partial<Record<VirtLayer, Set<string>>> = {};
  private total: Partial<Record<VirtLayer, number>> = {};

  private getSet = (source: VirtLayer) => this.data[source] ??= new Set();

  add = ({ source, ...xyz }: XYZ & {source: VirtLayer}) => {
    this.getSet(source).add(this.xyz2string(xyz));
    this.total[source] = (this.total[source] ?? 0) + 1;
    this.refresh();
  };
  delete = ({ source, ...xyz }: XYZ & {source: VirtLayer}) => {
    this.getSet(source).delete(this.xyz2string(xyz));
    if (this.getSet(source).size === 0) {
      delete this.data[source];
      delete this.total[source];
    }
    this.refresh();
  };

  refresh = () => {
    this.clear();
    Object.entries(this.data)
    .map(([key, val]) => [key, val.size])
    .forEach(([source, size], idx) => {
      if (idx !== 0) this.append(Container.from('br'));
      this.append(`${source}: ${size}/${this.total[source]}`);
    });
  };
}

export const imagesToFetch = new ImagesToFetch();
