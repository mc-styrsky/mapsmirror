import type { VirtLayer } from '../../../common/types/layers';
import type { XYZ } from '../../../common/types/xyz';
import { createBr } from '../../utils/createHTMLElement';
import { updateInfoBox } from './updateInfoBox';

class ImagesToFetch {
  constructor () {

  }
  private xyz2string = ({ x, y, z }: XYZ) => `${z.toString(16)}_${x.toString(16)}_${y.toString(16)}`;

  private data: Partial<Record<VirtLayer, Set<string>>> = {};
  private total: Partial<Record<VirtLayer, number>> = {};

  private getSet = (source: VirtLayer) => this.data[source] ??= new Set();

  add = ({ source, ...xyz }: XYZ & {source: VirtLayer}) => {
    this.getSet(source).add(this.xyz2string(xyz));
    this.total[source] = (this.total[source] ?? 0) + 1;
    updateInfoBox();
  };
  delete = ({ source, ...xyz }: XYZ & {source: VirtLayer}) => {
    this.getSet(source).delete(this.xyz2string(xyz));
    if (this.getSet(source).size === 0) {
      delete this.data[source];
      delete this.total[source];
    }
    updateInfoBox();
  };
  state = () => {
    return Object.entries(this.data)
    .map(([key, val]) => [key, val.size]);
  };
  stateHtml = () => {
    return this.state()
    .reduce(
      (arr, [source, size]) => {
        arr.push(createBr());
        arr.push(`${source}: ${size}/${this.total[source]}`);
        return arr;
      },
      <(HTMLElement | string)[]>[],
    );
  };
}

export const imagesToFetch = new ImagesToFetch();
