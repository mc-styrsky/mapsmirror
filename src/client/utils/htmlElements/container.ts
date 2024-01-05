import type { Appendable } from '../../globals/appendable';
import { entriesTyped } from '../../../common/entriesTyped';
import { kebabify } from '../kebabify';

type HtmlProps<E extends HTMLElement> = Partial<Omit<E, 'dataset' | 'style'>> & {
  classes?: (string | null | undefined)[];
  dataset?: Partial<E['dataset']>,
  style?: Partial<E['style']>;
}

declare const _: unique symbol;
interface Forbidden { [_]: typeof _; }
type NoOverride<T=void> = T & Forbidden;
export type Override<T=void> = Omit<T, '_'>

export class Container<Selector extends HTMLElement = HTMLDivElement> {
  static from <T extends keyof HTMLElementTagNameMap> (
    tag: T,
    props?: HtmlProps<HTMLElementTagNameMap[T]>,
  ): Container<HTMLElementTagNameMap[T]>;
  static from <T extends HTMLElement> (
    tag: T,
    props?: HtmlProps<T>,
  ): Container<T>;
  static from <T extends (keyof HTMLElementTagNameMap | HTMLElement)> (
    tag: T,
    props: HtmlProps<T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : T>,
  ) {
    const {
      classes,
      dataset,
      style,
      ...data
    } = props ?? {};
    const html = tag instanceof HTMLElement ? tag : document.createElement(tag);
    entriesTyped(data).forEach(([k, v]) => html[k] = v);

    if (classes) classes.forEach(c => {
      if (typeof c === 'string') html.classList.add(...c.split(' ').map(kebabify));
    });
    if (dataset) entriesTyped(dataset).forEach(([k, v]) => html.dataset[k] = v);
    if (style) entriesTyped(style).forEach(([k, v]) => html.style[k] = v);
    return new Container<T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : T>(html);
  }
  constructor ()
  constructor (html: Container<any>)
  constructor (html: HTMLElement)
  constructor (html: HTMLElement | Container<any> = Container.from('div')) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.html = html instanceof Container ? html.html : html;
  }


  readonly html: NoOverride<Selector>;

  clear (): NoOverride {
    this.html.innerHTML = '';
  }

  append (...items: (Appendable)[]): NoOverride<this> {
    items.forEach(item => {
      if (!item) return;
      else if (typeof item === 'string' || item instanceof Node) this.html.append(item);
      else if (item instanceof Container) this.html.append(item.html);
      else if (item.isMonoContainer === MonoContainer.isMonoContainer) {
        this.html.append(item.html);
      }
      else {
        console.error('item', item, 'is not appendable');
        throw Error('item is not appendable');
      }
    });
    return this as NoOverride<this>;
  }

  getBoundingClientRect (): NoOverride<DOMRect> {
    return this.html.getBoundingClientRect() as NoOverride<DOMRect>;
  }
}


export class MonoContainer<Selector extends HTMLElement = HTMLElement> extends Container<Selector> {
  protected constructor () {
    super();
  }
  protected static copyInstance (cont: Container<HTMLElement>, parentClass: typeof MonoContainer<HTMLElement>) {
    console.log(parentClass);
    parentClass.isMonoContainer = MonoContainer.isMonoContainer;
    parentClass._html = cont.html;
    parentClass.clear = () => cont.clear();
    parentClass.append = (...items) => cont.append(...items);
    parentClass.getBoundingClientRect = () => cont.getBoundingClientRect();
  }
  private static _html: Container<HTMLElement>['html'];
  static get html (): HTMLElement {
    return this._html;
  }
  static clear: Container<HTMLElement>['clear'];
  static append: Container<HTMLElement>['append'];
  static getBoundingClientRect: Container<HTMLElement>['getBoundingClientRect'];
  static isMonoContainer = Symbol();
}
