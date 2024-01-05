import type { Container, MonoContainer } from '../utils/htmlElements/container';

export type Appendable = Container<HTMLElement> | typeof MonoContainer<HTMLElement> | Node | string | null | undefined
