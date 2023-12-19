import { entriesTyped } from '../../common/fromEntriesTyped';

export function createHTMLElement<T extends keyof HTMLElementTagNameMap> (tag: T, {
  classes,
  dataset,
  style,
  zhilds,
  ...data
}: Partial<Omit<HTMLElementTagNameMap[T], 'dataset' | 'style'>> & {
  classes?: (string | null | undefined)[];
  dataset?: Partial<HTMLElementTagNameMap[T]['dataset']>,
  style?: Partial<HTMLElementTagNameMap[T]['style']>;
  zhilds?: (HTMLElement | string | null | undefined)[];
} = {}): HTMLElementTagNameMap[T] {
  const element = document.createElement(tag);

  entriesTyped(data).forEach(([k, v]) => element[k] = v);

  if (classes) classes.forEach(c => {
    if (typeof c === 'string') element.classList.add(...c.split(' '));
  });
  if (dataset) entriesTyped(dataset).forEach(([k, v]) => element.dataset[k] = v);
  if (style) entriesTyped(style).forEach(([k, v]) => element.style[k] = v);
  if (zhilds) zhilds.forEach(child => {
    if (!child) return;
    if (typeof child === 'string') element.append(document.createTextNode(child));
    else element.append(child);
  });
  return element;
}

export const createBr = () => createHTMLElement('br');
