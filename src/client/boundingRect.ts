export class Size {
  constructor (container: HTMLElement) {
    this._container = container;
    this.refresh();
  }
  refresh = () => {
    const { height, width } = this._container.getBoundingClientRect();
    this._height = height;
    this._width = width;
  };
  private _container: HTMLElement;
  private _height: number = 0;
  private _width: number = 0;
  get height () {
    return this._height;
  }
  get width () {
    return this._width;
  }
}
