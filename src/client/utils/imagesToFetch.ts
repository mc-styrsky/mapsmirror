import type { VirtLayers } from '../../common/types/layers';
import type { XYZ } from '../../common/types/xyz';
import { updateInfoBox } from '../updateInfoBox';
import { createHTMLElement } from './createHTMLElement';

class ImagesToFetch {
  constructor () {

  }
  private xyz2string = ({ x, y, z }: XYZ) => `${z.toString(16)}_${x.toString(16)}_${y.toString(16)}`;

  private data: Partial<Record<VirtLayers, Set<string>>> = {};
  private total: Partial<Record<VirtLayers, number>> = {};

  private getSet = (source: VirtLayers) => this.data[source] ??= new Set();

  add = ({ source, ...xyz }: XYZ & {source: VirtLayers}) => {
    this.getSet(source).add(this.xyz2string(xyz));
    this.total[source] = (this.total[source] ?? 0) + 1;
    updateInfoBox();
  };
  delete = ({ source, ...xyz }: XYZ & {source: VirtLayers}) => {
    this.getSet(source).delete(this.xyz2string(xyz));
    if (this.getSet(source).size === 0) delete this.data[source];
    updateInfoBox();
  };
  reset = () => {
    this.total = {};
  };
  state = () => {
    return Object.entries(this.data)
    .map(([key, val]) => [key, val.size]);
  };
  stateHtml = () => {
    return this.state()
    .reduce(
      (arr, [source, size]) => {
        arr.push(createHTMLElement({ tag: 'br' }));
        arr.push(`${source}: ${size}/${this.total[source]}`);
        return arr;
      },
      <(HTMLElement | string)[]>[],
    );
  };
}

export const imagesToFetch = new ImagesToFetch();
