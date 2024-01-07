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


export class Container<Tag extends keyof HTMLElementTagNameMap = 'div'> {
  constructor (
    tag: Tag | HTMLElementTagNameMap[Tag],
    props: HtmlProps<HTMLElementTagNameMap[Tag]> = {},
  ) {
    const {
      classes,
      dataset,
      style,
      ...data
    } = props ?? {};
    if (typeof tag === 'string') this.html = document.createElement<Tag>(tag);
    else this.html = tag;
    entriesTyped(data).forEach(([k, v]) => this.html[k] = v);

    if (classes) classes.forEach(c => {
      if (typeof c === 'string') this.html.classList.add(...c.split(' ').map(kebabify));
    });
    if (dataset) entriesTyped(dataset).forEach(([k, v]) => this.html.dataset[k] = v);
    if (style) this.style = style;
  }

  readonly html: HTMLElementTagNameMap[Tag];

  clear (): NoOverride {
    this.html.innerHTML = '';
  }

  set style (style: Partial<HTMLElementTagNameMap[Tag]['style']>) {
    entriesTyped(style).forEach(([k, v]) => this.html.style[k] = v);
  }

  append (...items: Appendable[]): NoOverride<this> {
    items.forEach(item => {
      if (!item) return;
      else if (typeof item === 'string' || item instanceof Node) this.html.append(item);
      else if (item) this.html.append(item.html);
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
