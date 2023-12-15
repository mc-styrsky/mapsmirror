export function createHTMLElement<T extends keyof HTMLElementTagNameMap> (params: Partial<Omit<HTMLElementTagNameMap[T], 'dataset' | 'style'>> & {
  classes?: (string | null | undefined)[];
  dataset?: Partial<HTMLElementTagNameMap[T]['dataset']>,
  style?: Partial<HTMLElementTagNameMap[T]['style']>;
  tag: T;
  zhilds?: (HTMLElement | string | null | undefined)[];
}): HTMLElementTagNameMap[T] {
  const { classes, dataset, style, tag, zhilds, ...data } = params;

  const element = document.createElement(tag);

  Object.entries(data).forEach(([k, v]) => element[k] = v);

  if (classes) classes.filter(Boolean).forEach(c => element.classList.add(c ?? ''));
  if (dataset) Object.entries(dataset).forEach(([k, v]) => element.dataset[k] = v);
  if (style) Object.entries(style).forEach(([k, v]) => element.style[k] = v);
  if (zhilds) zhilds.forEach(child => {
    if (!child) return;
    if (typeof child === 'string') element.append(document.createTextNode(child));
    else element.append(child);
  });
  return element;
}

export const createBr = () => createHTMLElement({ tag: 'br' });
