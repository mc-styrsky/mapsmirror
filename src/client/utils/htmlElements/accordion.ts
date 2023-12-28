import { Collapse } from 'bootstrap';
import { Container } from './container';

new Collapse(new Container().html);
export class Accordion extends Container {
  constructor ({ accordionId }: {
    accordionId: string;
  }) {
    super(Container.from('div', {
      classes: ['accordion'],
      id: accordionId,
    }));
  }
}
