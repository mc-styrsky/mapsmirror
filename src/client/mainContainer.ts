import { position } from './globals/position';
import { Container } from './utils/htmlElements/container';

export class MainContainer extends Container {
  constructor () {
    const containerId = new URL(import.meta.url).searchParams.get('container') ?? '';
    const container = document.getElementById(containerId);
    if (container instanceof HTMLDivElement) super(container);
    else throw Error('mainContainer needs to be a div');

    window.addEventListener('resize', () => {
      this.refresh();
    });
    this.refresh();
  }

  refresh = () => {
    const { height, width } = this.html.getBoundingClientRect();
    console.log('new bounding rect', { height, width });
    this._height = height;
    this._width = width;
    position.refresh();
  };

  private _height = NaN;
  private _width = NaN;
  get height () {
    return this._height;
  }
  get width () {
    return this._width;
  }
}

export const mainContainer = new MainContainer();
