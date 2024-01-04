import { entriesTyped } from '../../../common/fromEntriesTyped';
import { kebabify } from '../kebabify';

type HtmlProps<E extends HTMLElement> = Partial<Omit<E, 'dataset' | 'style'>> & {
  classes?: (string | null | undefined)[];
  dataset?: Partial<E['dataset']>,
  style?: Partial<E['style']>;
}

declare const _: unique symbol;
interface Forbidden { [_]: typeof _; }
type NoOverride<T=void> = T & Forbidden;

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

  append (...items: (string | Node | Container<HTMLElement> | undefined | null)[]): NoOverride<this> {
    items.forEach(item => {
      if (item instanceof Container) this.html.append(item.html);
      else if (item) this.html.append(item);
    });
    return this as NoOverride<this>;
  }

  getBoundingClientRect (): NoOverride<DOMRect> {
    return this.html.getBoundingClientRect() as NoOverride<DOMRect>;
  }
}
