import type { Container } from './containers/container';

export class Size {
  constructor (container: Container<any>) {
    this.container = container;
    this.refresh();
  }
  refresh = () => {
    const { height, width } = this.container.getBoundingClientRect();
    console.log('new bounding rect', { height, width });
    this._height = height;
    this._width = width;
  };
  private container: Container<any>;
  private _height: number = 0;
  private _width: number = 0;
  get height () {
    return this._height;
  }
  get width () {
    return this._width;
  }
}
